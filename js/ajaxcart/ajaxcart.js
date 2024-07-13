$j(document).ready(function () {
    $j("body").append(ajaxLoader);
    $j(".button.btn-update").remove();
    $j(".button2.btn-update").remove();

    // Changed all buttons with onclick attribute
    $j('.product-view .link-wishlist').replaceWith(wishlist);
    $j('.sidebar .btn-remove').attr('onclick', '');
    $j('.sidebar .actions a').attr('onclick', '');
    if (!$j('.catalog-product-view').hasClass('checkout-cart-configure')) {
        $j('.catalog-product-view .page .add-to-cart-buttons').empty().append(addButton);
    } else {
        $j('.catalog-product-view .page .add-to-cart-buttons').empty().append(updateButton);
    }

    win = new Window({
        id: "alphacube",
        className: "alphacube",
        title: "Please, choose product options",
        minWidth: 398,
        minHeight: 490,
        maxHeight: 1200,
        maxWidth: 1200,
        closable: true,
        minimizable: false,
        maximizable: false,
        resizable: false,
        draggable: false,
        onClose: closeAc,
        showEffect: Element.show,
        hideEffect: Element.hide
    });

    // Disable enter click event (when update qty - cleared all)
    $j("body.checkout-cart-index").keypress(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    });

    // Change view button to cart button
    $j(".category-products a.button").prop("title", "Add to Cart");
    $j(".category-products a.button").text("Add to Cart");

    // Remove onclick attribute, save value
    $j.each($j(".category-products .btn-cart"), function (k, v) {
        var onclick = v.onclick.toString();
        var url = onclick.substring(onclick.lastIndexOf('\''), onclick.indexOf('\'') + 1);
        v.value = url;
        $j(v).attr('onclick','');
    });

    // For theme rwd
    $j(document).on('click', "#header-cart a.close.skip-link-close", function (event) {
        event.preventDefault();
        hideShowMiniCart();
    });

    // For theme rwd
    $j(document).on('click', ".header-minicart a.skip-link.skip-cart", function (event) {
        event.preventDefault();
        hideShowMiniCart();
    });

    /**
     * Details show in minicart
     * Work only when jQuery update minicart (for rwd theme)
     */
    $j(document).on('mouseenter', "#cart-sidebar .truncated", function () {
        if (minicartUpdate) {
            if ($j(this).children(".truncated_full_value").hasClass('show')) {
                $j(this).children(".truncated_full_value").removeClass('show');
            } else {
                $j(this).children(".truncated_full_value").addClass('show');
            }
        }
    });

    /**
     * Details hide in minicart
     * Work only when jQuery update minicart (for rwd theme)
     */
    $j(document).on('mouseleave', "#cart-sidebar .truncated", function () {
        if (minicartUpdate) {
            if ($j(this).children(".truncated_full_value").hasClass('show')) {
                $j(this).children(".truncated_full_value").removeClass('show');
            } else {
                $j(this).children(".truncated_full_value").addClass('show');
            }
        }
    });

    /**
     * Work only when jQuery update minicart (for rwd theme)
     */
    function hideShowMiniCart() {
        if (minicartUpdate) {
            if ($j(".header-minicart a.skip-link.skip-cart").hasClass('skip-active')) {
                $j(".header-minicart a.skip-link.skip-cart").removeClass('skip-active');
                $j("#header-cart").removeClass('skip-active');
            } else {
                $j(".header-minicart a.skip-link.skip-cart").addClass('skip-active');
                $j("#header-cart").addClass('skip-active');
            }
        }
    }

    // Add to cart from category
    $j(document).on('click', ".category-products .btn-cart", function () {
        addToCart(this.value);
    });

    // Add to cart from category
    $j(document).on('click', ".checkout-cart-configure .btn-cart", function () {
        var dataForm = new VarienForm('product_addtocart_form', true);
        if (dataForm.validator.validate()) {
            var params = decodeURIComponent($j('#product_addtocart_form').serialize());
            var url = document.URL.replace('checkout/cart/configure/id/', 'ajaxcart/index/update?id=');
            addToCart(url.substring(0, url.length - 1) + "&" + params);
        }
    });

    // View button (change on add to cart label)
    $j(document).on('click', ".category-products a.button", function (event) {
        event.preventDefault();
        addToCart(this.href);
    });

    $j(document).on('click', ".page .button-product", function (event) {
        event.preventDefault();
        var dataForm = new VarienForm('product_addtocart_form', true);
        if (dataForm.validator.validate()) {
            addToCartProduct($j('#product_addtocart_form').serialize());
        }
    });

    // Wishlist link
    $j(document).on('click', ".category-products .link-wishlist", function (event) {
        event.preventDefault();
        ajaxWishlist(this.href);
    });

    // Wishlist link in product view
    $j(document).on('click', ".product-view .link-wishlist", function (event) {
        event.preventDefault();
        (this.href.indexOf(document.URL) == -1) ? ajaxWishlist(this.href) : ajaxWishlist($j('#product_addtocart_form').serialize());
    });

    // Wishlist block remove button
    $j(document).on('click', ".block-wishlist .btn-remove", function (event) {
        event.preventDefault();
        ajaxWishlistRemove(this.href);
    });

    // Wishlist block add to cart
    $j(document).on('click', ".block-wishlist .link-cart", function (event) {
        event.preventDefault();
        addToCart(this.href.replace("wishlist/index/cart", "ajaxcart/index/add"));
    });

    // Compare link
    $j(document).on('click', ".category-products .link-compare", function (event) {
        event.preventDefault();
        ajaxCompare(this.href);
    });

    // Compare link in product view
    $j(document).on('click', ".product-view .link-compare", function (event) {
        event.preventDefault();
        ajaxCompare(this.href);
    });

        // Compare block remove button
    $j(document).on('click', ".block-compare .btn-remove", function (event) {
        event.preventDefault();
        ajaxCompareRemove(this.href.replace("catalog/product_compare/remove/product/", "ajaxcart/index/removecompare/product/"));
    });

    /**
     * Main function
     * @param url - url add product to cart
     */
    function addToCart(url) {
        $j(".loading-mask").show();
        $j.ajax({
            url: url,
            dataType: "json",
            success: function (data) {
                $j(".loading-mask").hide();
                if (data.status == "ERROR") {
                    $j(".ajaxcart-error-msg").html(data.message);
                    $j("#ajaxcart-error").show();
                    return;
                }
                $j("#ajaxcart-success-msg").html(data.message);
                $j("#ajaxcart-success").show();
                if (data.sidebar) {
                    $j(".block-cart").html(data.sidebar);
                }
                if (data.toplink) {
                    $j(".top-link-cart").html(data.toplink);
                }
                if (data.pcart) {
                    $j(".cart").html(data.pcart);
                }
            }
        });
    }

    /**
     * Add product to cart from product view page
     * @param params - form parameters
     */
    function addToCartProduct(params) {
        $j(".loading-mask").show();
        $j.ajax({
            url: "ajaxcart/index/add",
            type: "POST",
            data: params,
            dataType: "json",
            success: function (data) {
                $j(".loading-mask").hide();
                if (data.status == "ERROR") {
                    $j(".ajaxcart-error-msg").html(data.message);
                    $j("#ajaxcart-error").show();
                    return;
                }
                $j("#ajaxcart-success-msg").html(data.message);
                $j("#ajaxcart-success").show();
                if (data.sidebar) {
                    $j(".block-cart").html(data.sidebar);
                }
                if (data.toplink) {
                    $j(".top-link-cart").html(data.toplink);
                }
                if (data.pcart) {
                    $j(".cart").html(data.pcart);
                }
            }
        });
    }

    /**
     * Add product to wishlist
     * @param url - wishlist url
     */
    function ajaxWishlist(url) {
        $j(".loading-mask").show();
        $j.ajax({
            url: url,
            dataType: "json",
            success: function (data) {
                $j(".loading-mask").hide();
                if (data.status == "ERROR") {
                    $j(".ajaxcart-error-msg").html(data.message);
                    $j("#ajaxcart-error").show();
                    return;
                }
                $j("#ajaxcart-success-msg").html(data.message);
                $j("#ajaxcart-success").show();
                if (data.sidebar) {
                    $j(".block-wishlist").html(data.sidebar);
                }
                if (data.toplink) {
                    $j(".top-link-wishlist").html(data.toplink);
                }
            }
        });
    }

    /**
     * Remove product from wishlist
     * @param url - wishlist remove url
     */
    function ajaxWishlistRemove(url) {
        $j(".loading-mask").show();
        $j.ajax({
            url: url,
            dataType: "json",
            success: function (data) {
                $j(".loading-mask").hide();
                if (data.status == "ERROR") {
                    $j(".ajaxcart-error-msg").html(data.message);
                    $j("#ajaxcart-error").show();
                    return;
                }
                $j("#ajaxcart-success-msg").html(data.message);
                $j("#ajaxcart-success").show();
                if (data.sidebar) {
                    $j(".block-wishlist").html(data.sidebar);
                }
                if (data.toplink) {
                    $j(".top-link-wishlist").html(data.toplink);
                }
            }
        });
    }

    /**
     * Add product to compare
     * @param url - compare url
     */
    function ajaxCompare(url) {
        $j(".loading-mask").show();
        $j.ajax({
            url: url,
            dataType: "json",
            success: function (data) {
                $j(".loading-mask").hide();
                if (data.status == "ERROR") {
                    $j(".ajaxcart-error-msg").html(data.message);
                    $j("#ajaxcart-error").show();
                    return;
                }
                $j("#ajaxcart-success-msg").html(data.message);
                $j("#ajaxcart-success").show();
                if (data.sidebar) {
                    $j(".block-compare").html(data.sidebar);
                }
                if (data.toplink) {
                    $j(".top-link-compare").html(data.toplink);
                }
            }
        });
    }

    /**
     * Remove product from compare
     * @param url - compare remove url
     */
    function ajaxCompareRemove(url) {
        $j(".loading-mask").show();
        $j.ajax({
            url: url,
            dataType: "json",
            success: function (data) {
                $j(".loading-mask").hide();
                if (data.status == "ERROR") {
                    $j(".ajaxcart-error-msg").html(data.message);
                    $j("#ajaxcart-error").show();
                    return;
                }
                $j("#ajaxcart-success-msg").html(data.message);
                $j("#ajaxcart-success").show();
                if (data.sidebar) {
                    $j(".block-compare").html(data.sidebar);
                }
                if (data.toplink) {
                    $j(".top-link-compare").html(data.toplink);
                }
            }
        });
    }
});

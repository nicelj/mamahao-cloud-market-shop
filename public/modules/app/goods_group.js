/*
 * 组合促销列表相关JS方法，复制  goods_promote.js  稍做改动，可能需要做优化;
 * by Adang
 * */
define(function (require, exports, module) {
    var page = {
        config: {
            params: M.url.params(),
            hashParams: function () {
                return M.url.getParams((location.hash.match(/(\w+=)([^\&]*)/gi) || []).join('&'));  //json params
            }
        },
        init: function (params) {
            var c = page.config;

            page.bindEvents();
        },
        bindEvents: function () {
            var $app = $('#app');
            //collapse
            $app.on('click', '.js-collapse', function () {
                var $this = $(this);
                $this.closest('.item').toggleClass('in');
            });

            //选择sku
            $app.on('click', '.js-sku', page.selectSku);

            //添加到购物车
            $app.on('click', '.js-addToCart', page.addToCart);

            //点击遮罩或关闭按钮
            $app.on('click', '.mask, .js-close', function () {
                $(this).closest('.u-fixed').removeClass('show');
            });

            //选完sku，点击确定
            $app.on('click', '.js-sku-confirm', function () {
                var $this = $(this), $goods = $('.js-sku.current').closest('.goods'), $item = $goods.closest('.item');
                //获取当前选中的sku信息
                require.async('app/sku', function (sku) {
                    var skuInfo = sku.selected();

                    if (!skuInfo.itemId) {
                        var specTips = $.map($('.sku dl dt'), function (item) {
                            if (!$(item).closest('dl').find('.sku-key.active')[0]) {
                                return $(item).text();
                            }
                        })[0];
                        return M.tips('请选择' + specTips);
                    }

                    //显示已选sku信息
                    $goods.attr('data-item-id', skuInfo.itemId)
                        .attr('data-price', skuInfo.detail.price)
                        .attr('data-oprice', skuInfo.detail.oprice)
                        .find('.spec').addClass('selected').text('已选' + skuInfo.desc.join(','))
                        .end().find('.pic img').attr('src', skuInfo.detail.itemPic);

                    //关闭模态框
                    $this.closest('.u-sku').find('.js-close').trigger('click');

                    //更新价格显示
                    if ($item.find('.goods[data-price]').length === $item.find('.goods').length) {
                        var discountPrice = +$item.data('discount'), originPriceAll = 0;
                        $.each($item.find('.goods'), function () {
                            var count = +$(this).data('count');
                            var oprice = $(this).attr('data-oprice') || $(this).attr('data-price');
                            var originPrice = M.calc.multiply(oprice, count);
                            originPriceAll = M.calc.add(originPriceAll, originPrice);
                        });
                        $item.find('.header em, .footer dt strong').text('￥' + M.calc.subtract(originPriceAll, discountPrice));
                        $item.find('.footer dd del').text('原价：￥' + originPriceAll);

                    }

                });
            });

        },
        //选择sku
        selectSku: function () {
            var $this = $(this), $item = $this.closest('.item'), $goods = $this.closest('.goods');
            var templateId = $goods.data('template-id');

            //添加标识
            $('.js-sku').removeClass('current');
            $this.addClass('current');

            //当前sku模态框，不需要再次初始化
            if (templateId === $('.js-sku-confirm').data('template-id')) {
                $('.u-sku').addClass('show');
                return false;
            }

            var params = {
                inlet: 6,
                reservedNo: $item.data('no'),
                templateId: templateId
            };
            var locationInfo = JSON.parse(localStorage.getItem(CONST.local_detail_location));
            if (locationInfo) {
                params.areaId = locationInfo.areaId;
                params.lat = locationInfo.lat;
                params.lng = locationInfo.lng;
            }
            M.ajax({
                location: true,
                url: '/api/goods_sku',
                data: {data: JSON.stringify(params)},
                success: function (res) {
                    $('.u-sku').find('.content').empty().append(res.template);
                    require.async('app/sku', function (sku) {
                        sku.init($('.sku'));
                        $('.quantity, .sku-sales').hide();
                        $('.js-sku-confirm').data('template-id', templateId);
                        $('.u-sku').addClass('show');
                    });
                }
            });
        },
        //添加商品到购物车
        addToCart: function () {
            var $this = $(this), $item = $this.closest('.item'), $goods = $item.find('.goods');
            var local_cartId = localStorage.getItem(CONST.local_cartId);   //本地购物车ID

            //校验是否全部都有itemId
            if ($item.find('.goods[data-item-id]').length < $goods.length) {
                return M.tips('请选择套餐的商品规格');
            }

            var itemArr = $.map($goods, function (item, index) {
                return {
                    "isBindShop": false,
                    "templateId": $(item).data('template-id'),
                    "itemId": $(item).data('item-id'),
                    "count": +$(item).data('count')
                };
            });

            var params = {
                cartId: local_cartId,
                jsonTerm: JSON.stringify(itemArr),
                pmtType: 4,
                reservedNo: $this.closest('.item').data('no')
            };
            M.ajax({
                location: true,
                url: '/api/addToCart',
                data: {data: JSON.stringify(params)},
                success: function (res) {
                    if (res.success_code == 200) {
                        localStorage.setItem(CONST.local_cartId, res.cartId);  //更新本地购物车ID
                        M.tips('套餐已成功添加到购物车');
                        $('.u-sku .js-close').trigger('click');
                    } else {
                        return M.tips(res.msg);
                    }
                }
            });
        }

    };

    page.init();
});
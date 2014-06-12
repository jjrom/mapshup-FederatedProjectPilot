/*
 *
 * mapshup - Webmapping made easy
 * 
 * http://mapshup.info
 *
 * Copyright Jérôme Gasperi, 2011.12.08
 *
 * jerome[dot]gasperi[at]gmail[dot]com
 *
 * This software is a computer program whose purpose is a webmapping application
 * to display and manipulate geographical data.
 *
 * This software is governed by the CeCILL-B license under French law and
 * abiding by the rules of distribution of free software.  You can  use,
 * modify and/ or redistribute the software under the terms of the CeCILL-B
 * license as circulated by CEA, CNRS and INRIA at the following URL
 * "http://www.cecill.info".
 *
 * As a counterpart to the access to the source code and  rights to copy,
 * modify and redistribute granted by the license, users are provided only
 * with a limited warranty  and the software's author,  the holder of the
 * economic rights,  and the successive licensors  have only  limited
 * liability.
 *
 * In this respect, the user's attention is drawn to the risks associated
 * with loading,  using,  modifying and/or developing or reproducing the
 * software by the user in light of its specific status of free software,
 * that may mean  that it is complicated to manipulate,  and  that  also
 * therefore means  that it is reserved for developers  and  experienced
 * professionals having in-depth computer knowledge. Users are therefore
 * encouraged to load and test the software's suitability as regards their
 * requirements in conditions enabling the security of their systems and/or
 * data to be ensured and,  more generally, to use and operate it in the
 * same conditions as regards security.
 *
 * The fact that you are presently reading this means that you have had
 * knowledge of the CeCILL-B license and that you accept its terms.
 */

/**
 * Plugin for the "GSCB Federated Project Pilot" project (FPP)
 * 
 * @author : Jerome Gasperi @ CNES
 * @date   : 2014.05.27
 *  
 * @param {MapshupObject} M
 */
(function (M) {

    M.Plugins.FPP = function () {

        /*
         * Only one FPP object instance is created
         */
        if (M.Plugins.FPP._o) {
            return M.Plugins.FPP._o;
        }

        /*
         * FPP div reference
         */
        this.$d = $();

        /*
         * Orthorectification WPS reference
         */
        this.wps = null;

        /*
         * Catalog layer reference
         */
        this.catalogLayers = {};

        /*
         * Reference to the active feature
         */
        this.feature = null;

        /*
         * Reference to the active product of the active feature
         */
        this.activeProduct = null;

        /**
         * Init plugin
         * 
         * @param {Object} options
         */
        this.init = function(options) {

            var self = this;

            /*
             * init options
             *
             *      catalogs:{}, // Array of catalogs (FEDEO, CNES, DLR, etc.)
             */
            self.options = options || {};

            /*
             * Set mapshup logo
             */
            M.$map.append('<div style="position:absolute;bottom:10px;right:30px;z-index:99999;"><a href="http://mapshup.info" title="Powered with mapshup" target="_blank"><img src="./img/mapshuplogo.png"/></a></div>');

            /*
             * Set the FPP structure
             */
            self.$d = M.Util.$$('#FPP', M.$mcontainer);

            /*
             * Download frame
             */
            M.Util.$$('#downloadIFrame', 'body').css({
                width: 0,
                height: 0
            });

            /*
             * Copyright
             */
            M.Util.$$('#copyright').append('<a href="http://www.cnes.fr">CNES</a> - <a href="http://www.dlr.de">DLR</a> - <a href="http://www.esa.int">ESA</a> | copyright © ' + (new Date()).getFullYear());

            /*
             * Add catalog search icon to navigation toolbar
             */
            if (M.Plugins.Navigation && M.Plugins.Navigation._o) {
                var tb = new M.Toolbar({
                    position: M.Plugins.Navigation._o.options.position,
                    orientation: M.Plugins.Navigation._o.options.orientation
                });

                tb.add({
                    tt: "Search for products",
                    icon: M.Util.getImgUrl('search.png'),
                    onoff: false,
                    onactivate: function(scope, item) {
                        var service;
                        if (M.Plugins.Search && M.Plugins.Search._o) {
                            for (service in M.Plugins.Search._o.services) {
                                M.Plugins.Search._o.search(M.Plugins.Search._o.services[service], {removeFirst:true});
                            }
                        }
                    }
                });
            }

            /*
             * For acacia toolbar
             */
            M.Map.events.register("resizeend", self, function(scope) {
                self.resize();
            });

            return self;

        };

        /*
         * Return a valid jquery id from input string
         */
        this.getId = function(str) {
            return '_' + M.Util.encode(str);
        };

        /*
         * Call on window resize
         */
        this.resize = function() {
            var $parent = $('._landcover', this.$d);
            if ($parent.length > 0) {
                $('.acaciaselector', this.$d).css({
                    'top': $parent.offset().top - $parent.height() + ($parent.outerHeight() - $parent.height() - 1),
                    'left': $parent.offset().left + $parent.width() + 10
                });
            }
        };

        /*
         * Show Raw product
         * 
         * @param {OpenLayers.Feature} feature
         * 
         */
        this.show = function(feature) {

            if (!feature) {
                return false;
            }

            var i, l, attributes = feature.attributes, id = this.getId(attributes.identifier) + '_os', self = this;

            /*
             * Store the selected feature as the active feature
             */
            self.feature = feature;

            /*
             * Show metadata panel
             */
            self.$d.show();

            /*
             * Show products (i.e. orthorectified images) if any
             */
            if (attributes.services && attributes.services.products) {

                l = attributes.services.products.length;

                /*
                 * Display products clickable thumbnails
                 * 
                 * +--------+--------+--------+
                 * |        |        |        |
                 * | thumb1 | thumb2 | thumb3 |
                 * |        |        |        |
                 * +--------+--------+--------+
                 * 
                 *           Download
                 *           Assess Quality
                 *           Get Land Cover
                 */
                self.$d.html('<div class="orthoselector"><ul id="' + id + '"></ul></div><div class="actionselector"><ul>' +
                        (M.Plugins['ACAcIA'] && M.Plugins['ACAcIA']._o ? '<li id="' + id + 'l" class="tool _landcover" jtitle="' + M.Util._("Compute Land Cover from this product") + '"><img src ="./fpp/img/getlandcover.png"></li>' : '') +
                        '<li id="' + id + 'a" class="tool" jtitle="' + M.Util._("Assess product quality") + '"><img src ="./fpp/img/assessquality.png"></li>' +
                        '<li id="' + id + 'd" class="tool" jtitle="' + M.Util._("Download this product") + '"><img src="./fpp/img/download.png"></li>' +
                        '<li id="' + id + 'z" class="tool" jtitle="' + M.Util._("Zoom on product") + '"><img src="./fpp/img/zoomon.png"></li>' +
                        '</ul></div>');

                if (l > 0) {

                    for (i = 0; i < l; i++) {

                        /*
                         * Activate or not
                         */
                        (function(product, $d) {

                            var pid = self.getId(product.identifier);

                            $d.append('<li id="' + pid + '" jtitle="' + M.Util._('Product resolution') + ' : ' + product.resolution + ' m" class="tool"><img src="' + feature.attributes.thumbnail + '"/></li>');
                            M.tooltip.add($('#' + pid), 'n');

                            /*
                             * Change download on click
                             */
                            $('#' + pid).click(function(e) {

                                e.preventDefault();
                                e.stopPropagation();

                                /*
                                 * Activate/Deactivate 
                                 */
                                self.switchActivate(product);

                                return false;
                            });

                        })(attributes.services.products[i], $('#' + id));

                    }

                    /*
                     * Set Toolbar action
                     */
                    self.setToolbarActions(id);

                }

                /*
                 * Launch a new orthorectification
                 */
                $('#' + id).append('<li id="addortho" class="box" jtitle="' + M.Util._("Create an orthorectified product") + '" style="padding: 5px 10px;">' + M.Util._("New product") + '</li>');
                M.tooltip.add($('#addortho'), 'n', 10);

                /*
                 * Prepare accaciaclassification
                 */
                $('#' + id).append('<li class="_acaciaclassification tool"></li>');

                /*
                 * initialize improve quality and show popup with form
                 */
                $('#addortho').click(function() {

                    var improveQuality = M.Plugins.FPP._o.improveQualityDescriptor;
                    improveQuality.clearInputs();
                    improveQuality.clearOutputs();

                    var input = {
                        type: 'LiteralData',
                        identifier: 'urn:ogc:cstl:wps:dream:improveQuality:input:metadataID',
                        data: attributes.identifier,
                        dataType: "xs:string"
                    };

                    improveQuality.addInput(input);

                    var output = {
                        type: 'ComplexOutput',
                        identifier: 'urn:ogc:cstl:wps:dream:improveQuality:output:orthoImage',
                        mimeType: 'text/plain'
                    };

                    improveQuality.addOutput(output);

                    self.improveQualityPopUp.show();

                    return false;

                });
            }
            /*
             * Otherwise clear info
             */
            else {
                self.$d.hide();
            }

            /*
             * Call processManager
             */
            if (M.apm) {
                for (i = M.apm.items.length; i--; ) {
                    self.processesCallback(M.apm.items[i]);
                }
            }
            return true;

        };

        /*
         * Activate/deactivate product identified by identifier
         * 
         * @param {Object} product
         */
        this.switchActivate = function(product) {

            var i, l, id, pid, layer;

            /*
             * If no active feature, nothing to do
             */
            if (!this.feature || !product) {
                return false;
            }

            /*
             * Hide ACAcIA toolbar
             */
            this.hideACAcIAToolbar();

            /*
             * Remove all mask layers
             */
            pid = this.getId(product.identifier);
            for (i = 0, l = this.feature.attributes.services.products.length; i < l; i++) {
                id = this.getId(this.feature.attributes.services.products[i].identifier);
                if ($('img', $('#' + id)).hasClass("active")) {
                    M.Map.removeLayer(M.Map.Util.getLayerByMID(this.feature.attributes.services.products[i].identifier));
                    M.Map.removeLayer(M.Map.Util.getLayerByMID(this.feature.attributes.services.products[i].identifier + "_qualityMask"));
                    M.Map.removeLayer(M.Map.Util.getLayerByMID(this.feature.attributes.services.products[i].identifier + "_shiftMask"));
                }
                if (id !== pid) {
                    $('img', $('#' + id)).removeClass('active');
                }
            }

            /*
             * Get current product WMS layer
             */
            layer = M.Map.Util.getLayerByMID(product.identifier);

            /*
             * If product is already active then deactivate
             */
            if ($('img', $('#' + pid)).hasClass('active')) {

                /*
                 * Remove active status
                 */
                $('img', $('#' + pid)).removeClass('active');

                /*
                 * Hide product related action toolbar
                 */
                $('.actionselector', this.$d).hide();

                /*
                 * Remove product related WMS layer
                 */
                M.Map.removeLayer(layer);

                /*
                 * Show catalog results layer
                 */
                for (var catalogLayer in this.catalogLayers) {
                    M.Map.Util.setVisibility(this.catalogLayers[catalogLayer], true);
                }
                
                /*
                 * No more active product
                 */
                this.activeProduct = null;

            }
            /*
             * Otherwise, set input product the active product
             */
            else {

                /*
                 * Set active status
                 */
                $('img', $('#' + pid)).addClass('active');

                /*
                 * Show product related action toolbar
                 */
                $('.actionselector', this.$d).css('left', $('#' + pid).offset().left + 10).show();

                /*
                 * Hide catalog results layer
                 */
                for (var catalogLayer in this.catalogLayers) {
                    M.Map.Util.setVisibility(this.catalogLayers[catalogLayer], false);
                }
                
                /*
                 * Show product related WMS layer
                 */
                if (!layer) {
                    layer = M.Map.addLayer({
                        type: "WMS",
                        layers: "",
                        MID: product.identifier,
                        url: product.browseUrl,
                        ol: {
                            singleTile: this.options.forceSingleTile ? true : false
                        }
                    });
                }

                /*
                 * Set this product the new active product
                 */
                this.activeProduct = product;
            }

            return true;

        };

        /*
         * Set action toolbar
         * 
         * @param {String} id : // identifier of parent div
         */
        this.setToolbarActions = function(id) {

            var self = this;

            /*
             * Zoom on Button
             */
            M.tooltip.add($('#' + id + 'z'), 'w');
            $('#' + id + 'z').click(function() {

                if (!self.activeProduct || !self.activeProduct.downloadUrl) {
                    return false;
                }

                var layer = M.Map.Util.getLayerByMID(self.activeProduct.identifier);
                if (layer) {
                    M.Map.zoomTo(layer.getDataExtent() || layer["_M"].bounds);
                }

                return false;

            });

            /*
             * Download Button
             */
            M.tooltip.add($('#' + id + 'd'), 'w');
            $('#' + id + 'd').click(function() {

                if (!self.activeProduct || !self.activeProduct.downloadUrl) {
                    return false;
                }

                /*
                 * Download to hidden iFrame
                 */
                $('#downloadIFrame').html('<iframe src="' + self.activeProduct.downloadUrl + '">');

                return false;

            });

            /*
             * Launch LandCover
             */
            M.tooltip.add($('#' + id + 'l'), 's');
            $('#' + id + 'l').click(function() {

                if (!self.activeProduct || !self.activeProduct.downloadUrl) {
                    return false;
                }

                if ($('.acaciaselector', self.$d).is(':visible')) {
                    self.hideACAcIAToolbar();
                }
                else {
                    self.showACAcIAToolbar(id);
                }

                return false;

            });

        };

        /*
         * hide ACAcIA toolbar
         */
        this.hideACAcIAToolbar = function() {

            var acacia = M.Plugins['ACAcIA'] ? M.Plugins['ACAcIA']._o : null;

            /*
             * No ACAcIA plugin or no active product
             */
            if (!acacia || !this.activeProduct) {
                return false;
            }

            /*
             * Hide toolbar
             */
            $('.acaciaselector', this.$d).hide();

            /*
             * Set all icon inactive
             */
            $('._landcover img', this.$d).removeClass('active');
            $('.acaciaselector', this.$d).each(function() {
                $('img', $(this)).removeClass('active');
            });

            /*
             * Switch back to Map default control
             */
            M.Map.resetControl(acacia.control);
            acacia.control = null;

            return true;

        };

        /*
         * Show ACAcIA toolbar
         * 
         * @param {String} parentId : parent identifier to link the toolbar
         */
        this.showACAcIAToolbar = function(parentId) {

            var self = this, id = '_acacia', acacia = M.Plugins['ACAcIA'] ? M.Plugins['ACAcIA']._o : null;

            /*
             * No ACAcIA plugin or no active product
             */
            if (!acacia || !this.activeProduct) {
                return false;
            }

            /*
             * Initialize ACAcIA toolbar
             */
            if ($('.acaciaselector', this.$d).length === 0) {

                self.$d.append('<div class="acaciaselector"><ul id="' + id + '">' +
                        '<li id="' + id + 'd" class="tool" jtitle="' + M.Util._("Draw classes") + '"><img src ="./fpp/img/acaciadraw.png"></li>' +
                        '<li id="' + id + 'c" class="tool" jtitle="' + M.Util._("Clear classes") + '"><img src="./fpp/img/acaciaclear.png"></li>' +
                        '<li id="' + id + 'p" class="tool" jtitle="' + M.Util._("Process") + '"><img src="./fpp/img/acaciaprocess.png"></li>' +
                        '</ul></div>');

                /*
                 * Draw classes action
                 */
                M.tooltip.add($('#' + id + 'd'), 's');
                $('#' + id + 'd').click(function(e) {

                    e.stopPropagation();
                    e.preventDefault();

                    /*
                     * Draw class is already activate -> deactivate
                     */
                    if ($('img', $(this)).hasClass('active')) {
                        $('img', $(this)).removeClass('active');
                        M.Map.resetControl(acacia.control);
                        acacia.control = null;
                    }
                    /*
                     * Activate draw classes
                     */
                    else {
                        $('img', $(this)).addClass('active');
                        acacia.drawClasses();
                    }

                    return false;

                });

                /*
                 * Clear classes action
                 */
                M.tooltip.add($('#' + id + 'c'), 's');
                $('#' + id + 'c').click(function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    acacia.clear();
                    return false;
                });

                /*
                 * Process layer
                 */
                M.tooltip.add($('#' + id + 'p'), 's');
                $('#' + id + 'p').click(function(e) {

                    e.stopPropagation();
                    e.preventDefault();

                    /*
                     * Launch process
                     */
                    acacia.process({
                        parentId: parentId
                    });

                    self.hideACAcIAToolbar();

                    return false;
                });

            }

            /*
             * Set image url to be the active product downloadUrl
             */
            acacia.imageToClassifyUrl = this.options.imageToClassifyUrl ? this.options.imageToClassifyUrl : this.activeProduct.downloadUrl;

            /*
             * Display toolbar
             */
            this.resize();
            $('.acaciaselector', this.$d).show();

            /*
             * Set landcover icon active
             */
            $('._landcover img', this.$d).addClass('active');

            return true;

        };

        /**
         * Processes callback function
         * 
         * This function is called each time a process is updated.
         * 
         * Process type is retrieved from descriptor identifier i.e.
         * 
         *  - urn:ogc:cstl:wps:dream:assessQuality
         *  - urn:ogc:cstl:wps:dream:improveQuality
         *  - urn:ogc:cstl:wps:orfeo:svmclassification
         * 
         * @param {M.WPS.asynchronousProcessManager.item} item object
         */
        this.processesCallback = function(item) {

            var $parentDiv, result, j, self = this, acacia = M.Plugins['ACAcIA'] ? M.Plugins['ACAcIA']._o : null;

            if (!item || !item.process) {
                return false;
            }

            if (item.process.descriptor) {

                $parentDiv = $('#' + item.process.parentId);

                /*
                 * Classification
                 */
                if (acacia && acacia.options.processId === item.process.descriptor.identifier) {

                    /*
                     * Start process
                     */
                    if (item.process.status === "ProcessAccepted") {
                        $('._acaciaclassification', $parentDiv)
                                .html('<img class="loading" src="./fpp/img/loading.gif"/>')
                                .attr('jtitle', M.Util._('Processing Land Cover'));
                        M.tooltip.add($('._acaciaclassification', $parentDiv), 'n');
                    }

                    /*
                     * Finished !
                     */
                    if (item.process.status === "ProcessSucceeded") {

                        /*
                         * Update each element that are identified in the process.result array
                         */
                        for (j = item.process.result.length; j--; ) {

                            /*
                             * Result should be a WMS layer
                             */
                            result = item.process.result[j];
                            if (result.data && typeof result.data.value === "object") {
                                if (M.Map.Util.getGeoType(result.data["mimeType"]) === 'WMS') {
                                    $('._acaciaclassification', $parentDiv)
                                            .html('<img src="./fpp/img/landcover.png"/>')
                                            .attr('jtitle', M.Util._('Display Land Cover'))
                                            .click(function(e) {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        var layer = M.Map.Util.getLayerByMID((new M.Map.LayerDescription(result.data.value, M.Map)).getMID());
                                        if (!layer) {
                                            $(this).attr('jtitle', M.Util._('Remove Land Cover'));
                                            M.Map.addLayer(result.data.value);
                                        }
                                        else {
                                            $(this).attr('jtitle', M.Util._('Display Land Cover'));
                                            M.Map.removeLayer(layer);
                                        }
                                        return false;
                                    });
                                    M.tooltip.add($('._acaciaclassification', $parentDiv), 'n');
                                    
                                    /*
                                     * Remove process from list (to remove Cookie)
                                     */
                                    M.apm.remove(item.process.statusLocation);
                                }
                            }
                        }
                    }
                }

            }
        };

        /*
         * Set unique instance
         */
        M.Plugins.FPP._o = this;

        return this;

    };
})(window.M);

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
         * Catalog layer reference
         */
        this.catalogLayers = {};

        /*
         * Reference to the active feature
         */
        this.feature = null;

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
            self.$d = M.Util.$$('#FPP', M.$mcontainer).html('<div class="orthoselector"><ul id="' + M.Util.getId() + '"></ul>');
            
            /*
             * Copyright
             */
            M.Util.$$('#copyright').append('<a href="http://www.cnes.fr">CNES</a> - <a href="http://www.dlr.de">DLR</a> - <a href="http://www.esa.int">ESA</a> | copyright © ' + (new Date()).getFullYear());

            /*
             * Add catalog search icon to navigation toolbar
             */
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
            
            /*
             * Acacia
             */
            if (M.Plugins['ACAcIA']) {
                
                tb.add({
                    tt: "Draw classes",
                    icon: M.Util.getImgUrl('drawing.png'),
                    onoff: true,
                    onactivate: function(scope, item) {
                        if (M.Plugins['ACAcIA']._o) {
                            M.Plugins['ACAcIA']._o.drawClasses();
                        }
                    },
                    ondeactivate:function(scope, item) {
                        if (M.Plugins['ACAcIA']._o) {
                            M.Map.resetControl(M.Plugins['ACAcIA']._o.control);
                            M.Plugins['ACAcIA']._o.control = null;
                        }
                    }
                });
                
                tb.add({
                    tt: "Clear classes",
                    icon: M.Util.getImgUrl('trash.png'),
                    onoff: false,
                    onactivate: function(scope, item) {
                        if (M.Plugins['ACAcIA']._o) {
                            M.Plugins['ACAcIA']._o.clear();
                            item.activate(false);
                        }
                    }
                });
        
            }
            
            return self;

        };

        /*
         * Return a valid jquery id based on feature thematic identifier
         */
        this.getFeatureId = function(feature) {
            
            if (!feature) {
                return null;
            }
            
            return '_' + M.Util.encode(feature.attributes.identifier);
        };
        
        /*
         * Return product download url from feature
         */
        this.getFeatureDownloadUrl = function(feature) {
            
            if (!feature) {
                return null;
            }
            
            /*
             * RESTo case - download url is under services attribute
             */
            if (feature.attributes.services && feature.attributes.services.download) {
                return feature.attributes.services.download.url;
            }
            
            /*
             * FEDEO case - download url is under atom attribute
             */
            if (feature.attributes.atom) {
                if ($.isArray(feature.attributes.atom.links)) {
                    for (var i = 0, l = feature.attributes.atom.links.length; i < l; i++) {
                        if (feature.attributes.atom.links[i].rel === 'enclosure') {
                            return feature.attributes.atom.links[i].href;
                        }
                    }
                }
            }
            
            return null;
        };

        /*
         * Call processManager to check if process(es) is(are) over
         */
        this.checkProcess = function() {
            if (M.apm) {
                for (var i = M.apm.items.length; i--; ) {
                    this.processesCallback(M.apm.items[i]);
                }
            }
            return true;
        };

        /*
         * Set ACAcIA toolbar
         */
        this.getFeatureActions = function(feature) {
            
            var self = this;
            
            /*
             * No ACAcIA plugin
             */
            if (!M.Plugins['ACAcIA']) {
                return null;
            }
            
            return [
                {
                    id: M.Util.getId(),
                    icon: M.Util.getImgUrl('execute.png'),
                    title: "Compute Land cover",
                    tt: "Compute Land cover",
                    callback: function() {
                        /*
                         * Set image url to be the active product downloadUrl
                         */
                        M.Plugins['ACAcIA']._o.imageToClassifyUrl = self.options.imageToClassifyUrl ? self.options.imageToClassifyUrl : self.getFeatureDownloadUrl(feature);
                        M.Plugins['ACAcIA']._o.process({
                            parentId: self.getFeatureId(feature)
                        });
                    }
                }
            ];
            
        };

        /**
         * Processes callback function
         * 
         * This function is called each time a process is updated.
         * 
         * Process type is retrieved from descriptor identifier i.e.
         * 
         *  - urn:ogc:cstl:wps:orfeo:svmclassification
         * 
         * @param {M.WPS.asynchronousProcessManager.item} item object
         */
        this.processesCallback = function(item) {

            var $parentDiv, result, j, acacia = M.Plugins['ACAcIA'] ? M.Plugins['ACAcIA']._o : null;

            if (!item || !item.process) {
                return false;
            }

            if (item.process.descriptor) {

                /*
                 * Classification
                 */
                if (acacia && acacia.options.processId === item.process.descriptor.identifier) {
                    
                    /*
                     * Create html container for loading status
                     */
                    $parentDiv = $('#' + item.process.parentId);
                    if ($parentDiv.length === 0) {
                        $('ul', this.$d).append('<li id="' + item.process.parentId + '" class="tool"></li>');
                        $parentDiv = $('#' + item.process.parentId);
                    }
                    
                    /*
                     * Start process
                     */
                    if (item.process.status === "ProcessAccepted") {
                        $parentDiv.html('<img class="loading" src="./fpp/img/loading.gif"/>')
                                .attr('jtitle', M.Util._('Processing Land Cover'));
                        M.tooltip.add($parentDiv, 's');
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
                                    $parentDiv.html('<img src="./fpp/img/landcover.png"/>')
                                            .attr('jtitle', M.Util._('Display Land Cover') + ' : ' + item.process.parentId)
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
                                    M.tooltip.add($parentDiv, 's');
                                    
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

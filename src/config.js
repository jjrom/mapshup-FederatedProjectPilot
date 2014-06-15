/*
 * mapshup - Webmapping made easy
 * http://mapshup.info
 *
 * Copyright 2011, Jérôme Gasperi
 *
 * jerome[dot]gasperi[at]gmail[dot]com
 *
 * This software is a computer program whose purpose is a webmapping application
 * to display and manipulate geographical data.
 *
 * This software is released under a dual licensing.
 *
 * Open Source License
 * --------------------------------------------------------------------
 * This software is governed by the CeCILL license under French law and
 * abiding by the rules of distribution of free software.  You can  use,
 * modify and/ or redistribute the software under the terms of the CeCILL
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
 * knowledge of the CeCILL license and that you accept its terms.
 *
 *
 * Commercial License
 * -----------------------------------------------------------------------
 * This is the appropriate option if you are creating proprietary applications
 * and you are not prepared to distribute and share the source code of your
 * application under the CeCILL license.
 * Please visit http://mapshup.info/license for more details.
 *
 */
(function(c) {

    c["FPPConfig"] = {};

    /*
     * The server address of the host.
     */
    c["FPPConfig"].serverHost = "http://localhost/devel/mapshup-FederatedProjectPilot/build";

    /*
     * IF simulated is set to true then simulated services are used
     * instead of default services
     */
    c["FPPConfig"].simulated = false;
    
    /*
     * OTB WPS server url
     */
    c["FPPConfig"].otbWPS = "http://constellation-wps.geomatys.com/cstl-wrapper/WS/wps/OTB_processing?service=WPS&";
    
    /*
     * OTB GetLandCover training list schema location
     */
    c["FPPConfig"].otbTrainingListSchemaLocation = "http://constellation-wps.geomatys.com/cstl-wrapper/webdav/OTB_processing/trainingList.xsd";

    /*
     * Default catalog layer options
     */
    c["FPPConfig"].getCatalogLayerOptions = function(options) {
        
        options = options || {};
        
        return {
            title:options.name,
            MID:'FPP' + options.name,
            clusterized: false,
            unremovable: true,
            directSearch: true, // Do not show filter popup when click on search
            onSearch: {
                zoom: false
            },
            featureInfo: {
                title: options.name + ' : $' + (options.titleProperty || 'title') + '$',
                noMenu: true,
                keys: {
                    'identifier': {
                        transform: function(v) {
                            return M.Util.shorten(v, 20, true);
                        }
                    }
                },
                /*
                 * Show FPP toolbar on feature selection
                 */
                onSelect: function(f) {
                    M.Plugins.FPP._o.show(f);
                    return true;
                },
                /*
                 * Hide FPP toolbar on feature unselection
                 */
                onUnselect: function(f) {
                    M.Plugins.FPP._o.$d.hide();
                    return true;
                }
            },
            ol: {
                styleMap: new OpenLayers.StyleMap({
                    "default": new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                        fillOpacity: 0.1,
                        strokeColor: options.fillColor || "#FFFFFF",
                        strokeWidth: 1,
                        fillColor: options.fillColor || "#000000"
                    },
                    OpenLayers.Feature.Vector.style["default"]),
                            {}),
                    "select": {
                        strokeColor: "#FFFF00",
                        fillColor: "#FFFF00",
                        fillOpacity: 0.1
                    }
                })
            }
        };
    };
    
    c.remove("plugins", "Search");
    c.add("plugins",
    {
        name:"Search",
        options:{
            services: [
                {
                    url:"http://geo.spacebel.be/opensearch/description.xml?parentIdentifier=EOP:ESA:DREAM:SENTINEL2_L1C_N2A&",
                    options:c["FPPConfig"].getCatalogLayerOptions({
                        name:'Fedeo-Take5',
                        fillColor:'#FFF'
                    })
                },
                {
                    url:"http://geo.spacebel.be/opensearch/description.xml?parentIdentifier=EOP:MDA-GSI:RSAT2_NRT&",
                    options:c["FPPConfig"].getCatalogLayerOptions({
                        name:'Fedeo-RSAT2',
                        fillColor:'#F00'
                    })
                },
                {
                    url:"http://spirit.cnes.fr/resto/Landsat/$describe",
                    options:c["FPPConfig"].getCatalogLayerOptions({
                        name:'CNES-Landsat',
                        fillColor:'#00F',
                        titleProperty:'identifier'
                    })
                }/*,
                {
                    url:"http://spirit.cnes.fr/take5/ws/opensearch.xml",
                    options:c["FPPConfig"].getCatalogLayerOptions({
                        name:'CNES-Take5',
                        fillColor:'#0F0'
                    })
                }*/
            ]
        }
    });

    /* ================= DO NOT EDIT UNDER THIS LINE    ==================== */

    if (c["FPPConfig"].simulated) {
        c["FPPConfig"].otbWPS = c["FPPConfig"].serverHost + '/fpp/ws/12_dummyOTBWPS.php?';
        c["FPPConfig"].otbTrainingListSchemaLocation = "http://constellation-wps.geomatys.com/cstl-wrapper/webdav/OTB_processing/trainingList.xsd";
        c["FPPConfig"].imageToClassifyUrl = 'http://ows10-eoprocessing.terradue.com/fpp-services/webdav/orthoImages/Spot5_Toulouse_J_IMAGERY4/30.0/gtiff.tiff';
    }

    /*
     * Update configuration options
     */
    c["general"].rootUrl = c["FPPConfig"].serverHost;
    c["general"].serverRootUrl = c["FPPConfig"].serverHost + '/s';
    c["general"].themePath = "/js/mapshup/theme/default";
    c["general"].indexPath = "/index.html";
    c["general"].refreshInterval = 1000;

    /**
     * Proxy url. Must be terminated by "?" or "&"
     */
    c["general"].proxyUrl = "/proxy.php?";

    /*
     * Note : plugins had been removed during build
     */
    c["general"].timeLine.enable = false;
    c["general"].overviewMap = "none";
    c["general"].displayContextualMenu = false;
    c["panels"]["side"].over = true;
    c["general"].location = {
        lon: 0,
        lat: 40,
        zoom: 3
    };
    
    /* 
     * LAYERS
     */
    c.remove("layers", "Satellite");
    c.remove("layers", "Streets");
    c.remove("layers", "Relief");
    c.remove("layers", "MapQuest OSM");
    c.remove("layers", "OpenStreetMap");
    c.add("layers", {
        type: "Bing",
        title: "Satellite",
        key: "AmraZAAcRFVn6Vbxk_TVhhVZNt66x4_4SV_EvlfzvRC9qZ_2y6k1aNsuuoYS0UYy",
        bingType: "Aerial"
    });

    c.extend("Navigation", {
        position: 'nw',
        orientation: 'h'
    });
    
    c.extend("LayersManager", {
        slideOverMap: false
    });
    
    /*
     * Add plugin FPP
     */
    c.add("plugins", {
        name: "FPP",
        options: {
            imageToClassifyUrl: c["FPPConfig"].imageToClassifyUrl,
            callback: function(o) {
                if (M.Plugins['FPP'] && M.Plugins['FPP']._o) {
                    if (typeof M.Plugins['FPP']._o.processesCallback === 'function') {
                        return M.Plugins['FPP']._o.processesCallback(o);
                    }
                }
            }
        }
    });

    /**
     * Assisted Classification of eArth observation ImAges (ACAcIA)
     * 
     * options:
     *      url: // Endpoint to OTB Web Processing Service
     *      processId: // WPS unique identifier for the OTB SVM classification process
     *      classes: // array of classification classes object
     *                  Structure of classification class object is 
     *                      {
     *                          className: // Name of the class (e.g. "Water")
     *                          classNumber: // Identifier of the class (e.g. "1")
     *                      }
     *                      
     */
    c.add("plugins", {
        name: "ACAcIA",
        options: {
            url: c["FPPConfig"].otbWPS,
            trainingListSchemaLocation: c["FPPConfig"].otbTrainingListSchemaLocation,
            processId: "urn:ogc:cstl:wps:orfeo:svmclassification",
            inputImageId: "urn:ogc:cstl:wps:orfeo:svmclassification:input:inputImage",
            sampleRatioId: "urn:ogc:cstl:wps:orfeo:svmclassification:input:sampleRatio",
            svmModelid: "urn:ogc:cstl:wps:orfeo:svmclassification:input:svmModel",
            trainingListId: "urn:ogc:cstl:wps:orfeo:svmclassification:input:trainingList",
            outputImageId: "urn:ogc:cstl:wps:orfeo:svmclassification:output:outputImage",
            classes: [
                {
                    className: "burned",
                    classNumber: "1"
                },
                {
                    className: "farmland",
                    classNumber: "2"
                },
                {
                    className: "grass",
                    classNumber: "3"
                },
                {
                    className: "road",
                    classNumber: "4"
                },
                {
                    className: "scrubland",
                    classNumber: "5"
                },
                {
                    className: "snow",
                    classNumber: "6"
                },
                {
                    className: "urban",
                    classNumber: "7"
                },
                {
                    className: "water",
                    classNumber: "8"
                },
                {
                    className: "wood",
                    classNumber: "9"
                }
            ],
            callback: function(o) {
                if (M.Plugins['FPP'] && M.Plugins['FPP']._o) {
                    if (typeof M.Plugins['FPP']._o.processesCallback === 'function') {
                        return M.Plugins['FPP']._o.processesCallback(o);
                    }
                }
            }
        }
    });
    
})(window.M.Config);

<?php
/*
 * mapshup - Webmapping made easy
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

include_once 'config.php';

/**
 * This script returns XML
 */
header("Pragma: no-cache");
header("Expires: 0");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-cache, must-revalidate");
header("Content-type: text/xml");

$request = isset($_REQUEST["request"]) ? $_REQUEST["request"] : "Execute";
if ($request == "GetCapabilities") {
    echo file_get_contents("13_dummyOTBWPS_GetCapabilities.xml");
}
elseif ($request == "DescribeProcess") {
    echo file_get_contents("14_dummyOTBWPS_DescribeProcess.xml");
}
elseif ($request == "succeeded") {
    echo str_replace('%MAPSHUP_FPP_ROOT_URL%', MAPSHUP_FPP_ROOT_URL, file_get_contents("16_dummyOTBWPS_Execute_SVM_Succeeded_real.xml"));
}
else {
    echo str_replace('%MAPSHUP_FPP_ROOT_URL%', MAPSHUP_FPP_ROOT_URL, file_get_contents("15_dummyOTBWPS_Execute_SVM_Accepted.xml"));
}
?>

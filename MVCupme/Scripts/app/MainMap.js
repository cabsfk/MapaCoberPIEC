/***************
DEMANDA
****************/


/*************************
COBERTURA
**************************/
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 4,
        color: '#00FFFF',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }

}


function resetHighlight(e) {
    glo.lyrCobertura.resetStyle(e.target);
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds(), { padding: [150, 150] });
    var layer = e.target;   
}
function onEachCobertura(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
    var nombre;
    //console.log(feature);
    if ($("#selecEscala").val() == "Municipio") {
        nombre = feature.properties.MPIO_CNMBR+ ' - '+getDto(feature.properties.DPTO_CCDGO);
    } else if ($("#selecEscala").val() == "Departamento") {
        nombre = feature.properties.NOMBRE;
    }
    
  
    var textlabel = '<h6>' + nombre + '</h6>' +
    '<small class="text-muted">Inversion Total: </small>' + numeral(feature.properties.COS_INV_TOTAL).format('$0,0') + '<br>' +
    '<small class="text-muted">Viviendas Beneficiadas: </small>' + numeral(feature.properties.COS_VSS).format('0,0') + '<br>' +
    '<small class="text-muted">Aumento de Cobertura: </small>' + numeral(feature.properties.AUMENTO_COBER).format('0,0.00') + '%<br>' +
    '<small class="text-muted">VSS totales del Mpio: </small>' + numeral(feature.properties.ICEE_VSS_TOT).format('0,0') + '<br>' +
    '<small class="text-muted">Deficit de cobertura base: </small>' + numeral(feature.properties.ICEE_ICEE_TOT_DEF * 100).format('0,0.00') + '%<br>' +
    '<small class="text-muted">ICCE_Base: </small>' + numeral(feature.properties.ICEE_ICEE_TOT * 100).format('0,0.00') + '%<br>' +
    '<small class="text-muted">Viviendas año base: </small>' + numeral(feature.properties.ICEE_VIVTOT).format('0,0') + '<br>' +
    '<small class="text-muted">Usuarios año base: </small>' + numeral(feature.properties.ICEE_US_TOT).format('0,0') + '<br>';
          
    layer.bindLabel( textlabel,{ 'noHide': true });
}
function styleCobertura(feature) {
    var VarMapeo = $('#selecVarMapeo').val();
    return {
        weight: 1.5,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.8,
        fillColor: getColor(feature.properties[VarMapeo]),
    };
};
function stylePoly(feature) {
    return {
        weight: 1.2,
        color: 'white',
        fillOpacity: 0.4,
        fillColor: 'white',
    };
};
function getIDMunDpt(filterOferta) {
    var idMun = [],idDepto=[],idMunDpto=[];
    //console.log(filterOferta);
    $.each(filterOferta.features, function (index, value) {
        idMun.push(value.properties.ID_DEPARTAMENTO + value.properties.ID_MUNICIPIO);
        idDepto.push(value.properties.ID_DEPARTAMENTO);
        value.properties.DPTOMUN = value.properties.ID_DEPARTAMENTO + value.properties.ID_MUNICIPIO;
    });
    
    var UniIdMun = idMun.unique();
    var UniIdDeto = idDepto.unique();
    //console.log(UniIdMun);
    //console.log(UniIdDeto);
    idMunDpto = [UniIdDeto,UniIdMun];
    return idMunDpto;
}




function calLeyenda(Gjson) {
    var VarMapeo = $('#selecVarMapeo').val();
    var removeAggregated = turf.remove(Gjson, VarMapeo, 0);
    
    if (removeAggregated.features.length > 0) {
        //console.log(removeAggregated);
        if (removeAggregated.features.length > 5) {
            glo.breaks = turf.jenks(removeAggregated, VarMapeo, 5);
        } else {
            glo.breaks = turf.jenks(removeAggregated, VarMapeo, removeAggregated.features.length - 1);
        }
        glo.breaks = glo.breaks.unique();
        /*console.log(' glo.breaks');
        console.log(glo.breaks);*/
        if (glo.breaks != null) {
            if (glo.breaks[0] != 0) {
                glo.breaks.unshift(0);
            }
        } else {
            glo.breaks = [];
            glo.breaks.push(0);
        }

    } else {
        glo.breaks = [];
        glo.breaks.push(0);
    }

}



function addCobertura(Gjson) {
    calLeyenda(Gjson);
    if (map.hasLayer(glo.lyrCobertura)) {
        map.removeLayer(glo.lyrCobertura);
    }
    glo.lyrCobertura = L.geoJson(Gjson, {
        onEachFeature: onEachCobertura,
        style: styleCobertura
    }).addTo(map);
    if (glo.addlegend == true) {
        legend.removeFrom(map);
        glo.addlegend == false;
    }
    
    VerLegend();
}
/*
map.on('overlayadd', function (eventLayer) {
    if (eventLayer.name === 'Demanda') {
        glo.lyrMate.bringToFront();
    }
    if (eventLayer.name === 'Oferta' ) {
        glo.lyrMate.bringToFront();
    }
});
*/
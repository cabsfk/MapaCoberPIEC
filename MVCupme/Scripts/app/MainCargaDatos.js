function getDto(Dpto) {

    var filDpto = turf.filter(glo.jsonDto, 'CODIGO_DEP', Dpto);
    if (filDpto.features.length > 0) {
        return filDpto.features[0].properties.NOMBRE;
    } else {
        return "Revise cod Dept";
    }

}

function getMunDto(Dpto, Mun) {

    var filDpto = turf.filter(glo.jsonDto, 'CODIGO_DEP', Dpto);
    var textMun = Dpto + Mun;
    var filMpio = turf.filter(glo.jsonMun, 'MPIO_CCNCT', textMun);
    return filMpio.features[0].properties.MPIO_CNMBR + ', ' + filDpto.features[0].properties.NOMBRE;
}





function VerLegend() {
    glo.addlegend = true;
    legend.addTo(map);
    $("#valuemin").empty().append('1 ' + glo.UniMate);
    $("#valuemax").empty().append(numeral(glo.maxDataCircle).format('0,0') + ' ' + glo.UniMate);
    $("#UniOferta").empty().append('[' + glo.UniMate + ']');
    if (glo.Anio != 0) {
        $('#LegendDemanda').show();
    } else {
        $('#LegendDemanda').hide();
    }
}


$("#selecEscala").change(function () {
    console.log('Ingreso a escala');
    CargaProyectosPIEC();
});


function sumCampo(fc, campo) {
    var sum_Campo = 0;
    for (var i = 0; i < fc.features.length; i++) {
        sum_Campo = sum_Campo + fc.features[i].properties[campo];

    }
    return sum_Campo;
}

function AsigData(Gjson, fCICEE, fC_COS_SITIOS, parame) {
    console.log(Gjson);
    var tmpICEE, tmpSITIOS, tmpTIPO;
    for (i = 0; i < Gjson.features.length; i++) {
        tmpICEE = turf.filter(fCICEE, parame.filEsc, Gjson.features[i].properties[parame.filEsc2]);
        tmpSITIOS = turf.filter(fC_COS_SITIOS, parame.filEsc3, Gjson.features[i].properties[parame.filEsc2]);
        tmpTIPO = turf.filter(tmpSITIOS, $("#selecDelta").val(), $("#selecEscenarios").val());
        if (tmpICEE.features.length > 0) {
            Gjson.features[i].properties.ICEE_USCAB_TOT = sumCampo(tmpICEE, 'ICEE_USCAB_TOT');
            Gjson.features[i].properties.ICEE_USRES_TOT = sumCampo(tmpICEE, 'ICEE_USRES_TOT');
            Gjson.features[i].properties.ICEE_US_TOT = sumCampo(tmpICEE, 'ICEE_US_TOT');
            Gjson.features[i].properties.ICEE_VIVCAB = sumCampo(tmpICEE, 'ICEE_VIVCAB');
            Gjson.features[i].properties.ICEE_VIVRES = sumCampo(tmpICEE, 'ICEE_VIVRES');
            Gjson.features[i].properties.ICEE_VIVTOT = sumCampo(tmpICEE, 'ICEE_VIVTOT');
            Gjson.features[i].properties.ICEE_VSS_CAB = sumCampo(tmpICEE, 'ICEE_VSS_CAB');
            Gjson.features[i].properties.ICEE_VSS_RES = sumCampo(tmpICEE, 'ICEE_VSS_RES');
            Gjson.features[i].properties.ICEE_VSS_TOT = sumCampo(tmpICEE, 'ICEE_VSS_TOT');
            Gjson.features[i].properties.ICEE_ICEE_TOT = Gjson.features[i].properties.ICEE_US_TOT / Gjson.features[i].properties.ICEE_VIVTOT;
            Gjson.features[i].properties.ICEE_ICEE_TOT_DEF = 1 - Gjson.features[i].properties.ICEE_ICEE_TOT;
            if (tmpTIPO.features.length > 0) {
                Gjson.features[i].properties.COS_INV_TOTAL = sumCampo(tmpTIPO, 'COS_INV_TOTAL');
                Gjson.features[i].properties.COS_VSS = sumCampo(tmpTIPO, 'COS_VSS');
            } else {
                Gjson.features[i].properties.COS_INV_TOTAL = 0;
                Gjson.features[i].properties.COS_VSS = 0;
            }
        } else {
            Gjson.features[i].properties.ICEE_USCAB_TOT = 0;
            Gjson.features[i].properties.ICEE_USRES_TOT = 0;
            Gjson.features[i].properties.ICEE_US_TOT = 0;
            Gjson.features[i].properties.ICEE_VIVCAB = 0;
            Gjson.features[i].properties.ICEE_VIVRES = 0;
            Gjson.features[i].properties.ICEE_VIVTOT = 0;
            Gjson.features[i].properties.ICEE_VSS_CAB = 0;
            Gjson.features[i].properties.ICEE_VSS_RES = 0;
            Gjson.features[i].properties.ICEE_VSS_TOT = 0;
            Gjson.features[i].properties.ICEE_ICEE_TOT = 0;
            Gjson.features[i].properties.ICEE_ICEE_TOT_DEF = 0;
            Gjson.features[i].properties.COS_INV_TOTAL = 0;
            Gjson.features[i].properties.COS_VSS = 0;
        }

    }
    console.log(Gjson);
}


function CargaProyectosPIEC() {
    waitingDialog.show();
    
    
    var query_ICEE = L.esri.Tasks.query({
        url: config.dominio + config.urlHostData + 'MapServer/' + config.ICEE
    });

    var IdProyecto = $("#selecProyecto").val();
    

    query_ICEE.where("1=1 and ICEE_AGNO=" + glo.anioProyecto[IdProyecto]).returnGeometry(false).run(function (error, fCICEE) {

        console.log('ingreso');
        var query_COS_SITIOS = L.esri.Tasks.query({
            url: config.dominio + config.urlHostData + 'MapServer/' + config.COS_SITIOS
        });

        query_COS_SITIOS.where("1='1' and PLA_ID=1").returnGeometry(false).run(function (error, fC_COS_SITIOS) {
            console.log(fC_COS_SITIOS);
            
            if (error == undefined) {
                
                if ($("#selecEscala").val() == "Municipio") {
                    parame={
                        filEsc: 'MPIO_CCNCT',
                        filEsc2: 'MPIO_CCNCT',
                        filEsc3: 'MPIO_CCNCT'
                    }

                    AsigData(glo.jsonMun,fCICEE,fC_COS_SITIOS,parame);
                } else {
                    parame = {
                        filEsc: 'DPTO_CCDGO',
                        filEsc2: 'CODIGO_DEP',
                        filEsc3: 'COD_DPTO'
                    }
                    AsigData(glo.jsonDto, fCICEE, fC_COS_SITIOS, parame);                    
                }
            } 
            
            waitingDialog.hide();
        });

    });
}


function getDeptoSimp() {
    
    var queryDeptSimpli = L.esri.Tasks.query({
        url: config.dominio + config.urlHostData + 'MapServer/' + config.DPTO_GEN
    });

    queryDeptSimpli
        .fields(['CODIGO_DEP', 'NOMBRE'])
        .orderBy(['CODIGO_DEP']);
    queryDeptSimpli.where("1=1").run(function (error, geojson) {
        glo.jsonDto = geojson;
    });
    var queryMunSimpli = L.esri.Tasks.query({
        url: config.dominio + config.urlHostData + 'MapServer/' + config.MPIO_GEN
    });

    queryMunSimpli
      .returnGeometry(true)
      .fields(['DPTO_CCDGO', 'MPIO_CCDGO', 'MPIO_CCNCT', 'MPIO_CNMBR'])
      .orderBy(['MPIO_CCNCT']);
    queryMunSimpli.where("1=1").run(function (error, geojson) {
        glo.jsonMun = geojson;
        CargaProyectosPIEC();
    });
}



getDeptoSimp();

$("#BuscarMapa").click(function () {
    //console.log("Busco");
    legend.removeFrom(map);
    getFondosData();
});
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
    
    $('#legendEscenario').empty().text($('#selecEscenarios option:selected').text());

    $('#legendMapeo').empty().text($('#selecVarMapeo option:selected').text());
    
    
    
}

function loadmap(i,all) {
    var IdProyecto = $("#selecProyecto").val();
    var Gjson;
    if ($("#selecEscala").val() == "Municipio") {
        Gjson = AsigData(glo.jsonMun, glo.fCICEE, glo.fC_COS_SITIOS, glo.parameMUN, glo.anioProyecto[IdProyecto]+i,all);
    } else {
        Gjson = AsigData(glo.jsonDto, glo.fCICEE, glo.fC_COS_SITIOS, glo.parameDpto, glo.anioProyecto[IdProyecto]+i,all);
    }
    addCobertura(Gjson);
}

$("#selecProyecto").change(function () {
    CargaProyectosPIEC();
});

$("#selecEscala,#selecEscenarios,#selecDelta,#selecVarMapeo").change(function () {
    loadmap(0, true);
});

function sumCampo(fc, campo) {
    var sum_Campo = 0;
    for (var i = 0; i < fc.features.length; i++) {
        sum_Campo = sum_Campo + fc.features[i].properties[campo];
    }
    return sum_Campo;
}
function selctAnio(i) {
    $(".time").removeClass('btn-default');
    $(".time").addClass('btn-primary');
    $("#time" + i).removeClass('btn-primary');
    $("#time" + i).addClass('btn-default');
    $("#time" + i).text();
    if (i >= 0) {
        loadmap(i, false);
    } else {
        loadmap(0, true);
    }
       
    
    
}
function addAnios() {
    $("#anios").empty();
    var IdProyecto = $("#selecProyecto").val();
    $("#linea_tiempo").css("margin-left", glo.etapasProyecto[IdProyecto]*25*-1);
    if (glo.anioProyecto[IdProyecto] != 0) {
        for (i = 0; i < glo.etapasProyecto[IdProyecto]; i++) {
            if (i == 0) {
                $("#anios").append('<button id="time-1" type="button" class="time btn btn-default btn-sm " onClick="selctAnio(' +
                    -1 + ');">Todos</button>');
                $("#anios").append('<button id="time' +
                    i + '" type="button" class="time btn btn-primary btn-sm " onClick="selctAnio(' +
                    i + ');">' + (parseInt(glo.anioProyecto[IdProyecto]) + i) + '</button>');
            } else {
                $("#anios").append('<button id="time' +
                    i + '" type="button" class="time btn btn-primary btn-sm " onClick="selctAnio(' +
                    i + ');">' + (parseInt(glo.anioProyecto[IdProyecto]) + i) + '</button>');
            }
        }
    }

}
function AsigData(Gjson, fCICEE, fC_COS_SITIOS, parame, anio, all) {
    //console.log(Gjson);
    var tmpICEE, tmpSITIOS, tmpTIPO,tmpANIO,tmp;
    
    for (i = 0; i < Gjson.features.length; i++) {
        tmpICEE = turf.filter(fCICEE, parame.filEsc, Gjson.features[i].properties[parame.filEsc2]);
        tmpSITIOS = turf.filter(fC_COS_SITIOS, parame.filEsc3, Gjson.features[i].properties[parame.filEsc2]);
        tmpTIPO = turf.filter(tmpSITIOS, $("#selecDelta").val(), $("#selecEscenarios").val());
        if (all == false) {
            tmpANIO = turf.filter(tmpTIPO, 'VIGENCIA', anio);
            tmp = tmpANIO;
        } else {
            tmp = tmpTIPO;
        }
        
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
            if (tmp.features.length > 0) {
                Gjson.features[i].properties.COS_INV_TOTAL = sumCampo(tmp, 'COS_INV_TOTAL');
                Gjson.features[i].properties.COS_VSS = sumCampo(tmp, 'COS_VSS');
                Gjson.features[i].properties.AUMENTO_COBER = (((Gjson.features[i].properties.COS_VSS + Gjson.features[i].properties.ICEE_US_TOT) / Gjson.features[i].properties.ICEE_VIVTOT) - Gjson.features[i].properties.ICEE_ICEE_TOT)*100;

                console.log(Gjson.features[i].properties[parame.filEsc2]);
                console.log(Gjson.features[i].properties.COS_VSS);
            } else {
                Gjson.features[i].properties.COS_INV_TOTAL = 0;
                Gjson.features[i].properties.COS_VSS = 0;
                Gjson.features[i].properties.AUMENTO_COBER = 0;
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
            Gjson.features[i].properties.AUMENTO_COBER = 0;
        }

    }
    
    return Gjson;
}


function CargaProyectosPIEC() {
    waitingDialog.show();
    
    
    var query_ICEE = L.esri.Tasks.query({
        url: config.dominio + config.urlHostData + 'MapServer/' + config.ICEE
    });

    var IdProyecto = $("#selecProyecto").val();
    

    query_ICEE.where("1=1 and ICEE_AGNO=" + glo.anioProyecto[IdProyecto]).returnGeometry(false).run(function (error, fCICEE) {
        glo.fCICEE = fCICEE;
        
        var query_COS_SITIOS = L.esri.Tasks.query({
            url: config.dominio + config.urlHostData + 'MapServer/' + config.COS_SITIOS
        });

        query_COS_SITIOS.where("1='1' and PLA_ID=" + IdProyecto).returnGeometry(false).run(function (error, fC_COS_SITIOS) {
            glo.fC_COS_SITIOS = fC_COS_SITIOS;
            console.log(glo.fC_COS_SITIOS);
            if (error == undefined) {
                addAnios();
                loadmap(0,true);
            } 
            
            waitingDialog.hide();
        });

    });
}


function getDeptoSimp() {
    waitingDialog.show();

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
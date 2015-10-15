
//Definicion de layers

var LyrMunicipioDpto


/*
Busqueda Por Municipio!!!
*/
$("#city").autocomplete({
    source: function (request, response) {
        $("#BtnBusquedaMun").empty().append("<span class='glyphicon glyphicon-repeat'></span>").removeClass("btn-default").addClass("btn-warning");
        var ServiceDaneFind = L.esri.Tasks.find({
            url: config.dominio + config.urlHostDP + 'MapServer'
        });
        ServiceDaneFind.layers('0').returnGeometry(false).text(request.term).fields('MPIO_CNMBRSA,MPIO_CNMBR');

        ServiceDaneFind.run(function (error, FCMPIO, response2) {
            ServiceDaneFind.layers('1').returnGeometry(false).text(request.term).fields('DPTO_CNMBR');
            ServiceDaneFind.run(function (error, FCDPTO, response2) {
                $("#BtnBusquedaMun").empty().append("<span class='glyphicon glyphicon-search'></span>").removeClass("btn-warning").addClass("btn-default");
                var result = turf.featurecollection(FCMPIO.features.concat(FCDPTO.features));
                response($.map(result.features, function (el) {
                    if (el.properties.MPIO_CNMBR != undefined) {
                        return {
                            label: el.properties.MPIO_CNMBR + " - " + el.properties.DPTO_CNMBR,
                            value: el.properties.MPIO_CNMBR + " - " + el.properties.DPTO_CNMBR,
                            geojson: el
                        };
                    } else {
                        return {
                            label: el.properties.DPTO_CNMBR,
                            value: el.properties.DPTO_CNMBR,
                            geojson: el
                        };
                    }

                }));
            });
        });
    },
    minLength: 3,
    select: function (event, ui) {

        if (map.hasLayer(LyrMunicipioDpto)) {
            map.removeLayer(LyrMunicipioDpto);
        }
        BusquedaAdministrativa(ui.item.geojson);

    },
    open: function () {
        $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
        $(this).addClass("list-group");
    },
    close: function () {
        $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
    }
}).keypress(function (e) {
    if (e.keyCode === 13) {
        e.preventDefault();
        return false;
    }
}).autocomplete("instance")._renderItem = function (ul, item) {
    ul.addClass("list-group");
    ul.addClass("Ancho");
    return $('<li class="list-group-item ">')
        .append('<small>' + item.label + '</small>' +
                '</li>').appendTo(ul);
};

var BusquedaAdministrativa = function (json) {

    var lyrZoom;
    if (json.properties.MPIO_CNMBR != undefined) {
        lyrZoom = turf.filter(glo.jsonMun, 'MPIO_CNMBR', json.properties.MPIO_CNMBR);
    } else {
        lyrZoom = turf.filter(glo.jsonDto, 'CODIGO_DEP', json.properties.DPTO_CCDGO);
    }

    LyrMunicipioDpto = L.geoJson(lyrZoom, {
        style: function (feature) {
            return {
                color: '#8904B1',
                weight: 5,
                opacity: 1,
                fillOpacity: 0.007
            }
        }
    }).addTo(map).bringToBack();
    map.fitBounds(LyrMunicipioDpto.getBounds());
}


$("#BtnLimpiarMun").click(function () {
    if (map.hasLayer(LyrMunicipioDpto)) {
        map.removeLayer(LyrMunicipioDpto);
    }

    map.setView([4.12521648, -74.5020], 5);
    $("#city").val("");
    $("#city").focus();

});


/**
 * Regroupe toute les fonctions de zoom sur les cartes. Tel que la synchro ou le reset du zoom...
 *
 * @author Sylvain JARRY
 */

/**
 * Zoom et pan sur les cartes. zoom avec la molette souris, pan en cliqué glissant souris.
 * Le zoom est synchronisé entre toute les cartes, excepté sur celles dont la case "Désynchroniser" est coché.
 * C'est à dire si synchro = false.
 * Lors de l'appel de cette fonction, l'objet Carte n'est pas encore créé, on ne peut donc pas l'utiliser pour récuperer
 * les parametres de la carte. On utilise donc l'id de la carte pour la retrouver dans le tableau des cartes.
 * @param id
 *          identifiant de la carte sur laquelle on clique actuellement.
 */
function zoomFunction(id) {
    var index = indexTableau(id);
    if (!tableauCarte[index].synchro) {
        internZoom(tableauCarte[index]);
    }
    else {
        for (var i = 0; i < tableauCarte.length; i++) {
            if (tableauCarte[i].synchro) {
                internZoom(tableauCarte[i]);
            }
        }
    }
    function internZoom(carte) {
        carte.cartogroupe.attr("transform", "translate(" + d3.event.translate +
            ")scale(" + (d3.event.scale) + ")");
        carte.planigroupe.attr("transform", "translate(" + d3.event.translate +
            ")scale(" + (d3.event.scale) + ")");
        //Mettre a jour l'instance de zoom avant les cercles, sinon probleme de mise a l'echelle
        carte.zoom.scale(d3.event.scale).translate(d3.event.translate);
        zoomTranslateCircle(carte);
    }
}
/**
 * Permet d'effectuer un zoom semantic sur la carte placée en parametre.
 * Les cercles représentant les données sont espacé entre eux proportionnelement à la
 * taille du svg et à la valeur du zoom.
 *
 * @param carte
 *          carte sur laquelle s'applique les transformations
 */
function zoomTranslateCircle(carte) {
    //parcour tout les cercles du groupe.
    carte.circlegroupe.selectAll("circle").each(function () {
        var elt = d3.select(this);
        /* Pour chaque cercles on ajoute un attribut transforme, avec pour valeur de translate
         * la "position du cercle selectionné mis a l'échelle" moins "la position du cercle selectionné".
         * De cette maniere les cercles restent au milieu du pays auquel ils appartiennent.
         */
        elt.attr("transform", function () {
            var cx = carte.scaleX(elt.attr("cx")) - elt.attr("cx");
            var cy = carte.scaleY(elt.attr("cy")) - elt.attr("cy");

            return "translate(" + cx + "," + cy + ")";
        });
    });
}

/**
 * Synchronise le zoom par défaut des cartes créées par l'utilisateur avec le
 * zoom de la premiere carte.
 *
 * @param carte
 *              carte sur laquel synchroniser le zoom avec la premiere carte.
 */
function synchroZoom(carte) {
    if (compteurCarte > 0) {
        carte.cartogroupe.attr("transform", function () {
            return tableauCarte[0].cartogroupe.attr("transform");
        });
        carte.planigroupe.attr("transform", function () {
            return tableauCarte[0].planigroupe.attr("transform");
        });
        //Mettre a jour l'instance de zoom avant les cercles, sinon probleme de mise a l'echelle
        carte.zoom.scale(tableauCarte[0].zoom.scale()).translate(tableauCarte[0].zoom.translate());
        zoomTranslateCircle(carte);
    }
}

/**
 * S'active par un double clique sur une carte
 * Permet de revenir a la position d'origine du zoom c'est à dire sans translation et un scale de 0
 * On vérifie si la case desynchro du zoom est coché, on vérifie aussi que l'attribut transform n'est pas nul
 * ou vide sinon cela cause des erreurs.
 * Lors de l'appel de cette fonction, l'objet Carte n'est pas encore créé, on ne peut donc pas l'utiliser pour récuperer
 * les parametres de la carte. On utilise donc l'id de la carte pour la retrouver dans le tableau des cartes.
 *
 * @param id
 *          Identifiant de la carte sur laquel on vient de double cliquer.
 */
function resetZoom(id) {
    var index = indexTableau(id);
    if (!tableauCarte[index].synchro && tableauCarte[index].cartogroupe.attr("transform") != null
        && tableauCarte[index].cartogroupe.attr("transform") != "") {
        internResetZoom(tableauCarte[index]);
    }
    else {
        for (var i = 0; i < tableauCarte.length; i++) {
            if (tableauCarte[i].synchro && tableauCarte[i].cartogroupe.attr("transform") != null
                && tableauCarte[index].cartogroupe.attr("transform") != "") {
                internResetZoom(tableauCarte[i])
            }
        }
    }
    function internResetZoom(carte) {
        carte.cartogroupe.transition().duration(700).attr("transform", "translate(0,0)scale(1)");
        carte.planigroupe.transition().duration(700).attr("transform", "translate(0,0)scale(1)");
        carte.circlegroupe.selectAll("circle").each(function () {
            d3.select(this).transition().duration(700).attr("transform", "translate(0,0)");
        });
        carte.zoom.scale(1).translate([0, 0]);
    }
}

/**
 * Modifie la variable "synchro" de l'objet carte correspondant au paramettre id.
 * Par défaut la variable est a true, on la passe donc a false lorsque l'on veut
 * désynchroniser une carte par rapport aux autres.
 *
 * @param id
 *          id de la carte que l'on veut modifier.
 */
function desynchroZoom(id) {
    for (var i = 0; i < tableauCarte.length; i++) {
        if (tableauCarte[i].id == id) {
            tableauCarte[i].synchro = !document.getElementById("checkZoom" + id).checked;
        }
    }
}

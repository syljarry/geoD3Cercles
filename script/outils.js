/**
 * Regroupement des fonction Outils, comme le masquage d'élément, l'obtention
 * de la case coché parmis les boutons radio, la suppression des cartes, et d'autres...
 *
 * @author Sylvain JARRY
 */

/**
 * Renvoi le type d'organisation des cartes choisi par l'utilisateur.
 *
 * @returns {string}
 *          liste : pour avoir les carte en liste.
 *          grille : pour avoir les cartes en grille.
 */
var getOrga = function () {
    var orga = document.getElementById("liste").checked;
    if (orga == true) {
        return "liste";
    }
    orga = document.getElementById("grille").checked;
    if (orga == true) {
        return "grille";
    }
    orga = document.getElementById("colonne").checked;
    if (orga == true) {
        return "colonne";
    }
};

/**
 * Renvoi le type d'organisation des légendes choisis par l'utilisateur.
 *
 * @returns {string}
 *          Gauche : legend situé a gauche
 *          Unique : Une seul légende sur la premiere carte.
 *          Dessous : Legende situé en dessous.
 */
var getOrgaLegend = function() {
    var orga = document.getElementById("Gauche").checked;
    if (orga == true) {
        return "Gauche";
    }
    orga = document.getElementById("Unique").checked;
    if (orga == true) {
        return "Unique";
    }
    orga = document.getElementById("Dessous").checked;
    if (orga == true) {
        return "Dessous";
    }
};
/**
 * Renvoi le type de disposition des données actuelement sélectionné.
 *
 * @returns {string}
 */
var getDispo = function (dispo) {
    if (dispo == "Tous") {
        return racine_tot;
    }
    if (dispo == "SCI") {
        return racine_sci;
    }
    if (dispo == "SVE") {
        return racine_sve;
    }
    if (dispo == "VP") {
        return racine_vp;
    }
    if (dispo == "VSI") {
        return racine_vsi;
    }
};
/**
 * Renvoi l'année actuelement séletionnée
 *
 * @returns {string}
 */
var getYear = function () {
    return d3.select(".yearselect").text();
};
/**
 * Permet de récupérer la description associée au type de disposition passée en parametre.
 * Les description se trouve dans un tableau initialisé dans les parametres.
 * @param dispo
 *          Type de disposition dont on veut récupérer la description.
 * @returns {string}
 *          chaine de caractere contenant la description.
 */
var getDescription = function(dispo) {
    switch (dispo) {
        case(racine_tot):
            return tableauDescription[0];
            break;
        case(racine_sci):
            return tableauDescription[1];
            break;
        case(racine_sve):
            return tableauDescription[2];
            break;
        case(racine_vp):
            return tableauDescription[3];
            break;
        case(racine_vsi):
            return tableauDescription[4];
            break;
        default:
            break;
    }
};
/**
 *  Calcul du rayon des cercles proportionnels de la carte en fonction
 *  des valeurs donnés en paramettres.
 *
 * @param d
 *          valeur de la donnée
 * @returns {number}
 *          rayon du cercle correspondant à la donnée
 */
var calc_rayon = function (d) {
    return 3 * Math.sqrt(d / Math.PI);
};
/**
 * Cherche la position dans le tableau de carte,
 * de l'objet carte qui correspond a l'id passé en parametre.
 *
 * @param id
 *          identifiant de l'objet carte que l'on veut trouver
 */
var indexTableau = function(id) {
    for (var i = 0; i < tableauCarte.length; i++) {
        if (id == tableauCarte[i].id) {
            return i;
        }
    }
};

/**
 * Supprime la carte correspondant à l'id passé en parametre.
 * Supprime l'objet du tableau, ainsi que la <div> correspondante.
 * Reposition également toute les autres cartes, en appellant designCarte().
 *
 * @param id
 *          identifiant de l'objet carte que l'on veut supprimer
 */
function suppressionCarte(id) {
    //supprime l'element du tableau de carte global.
    tableauCarte.splice(indexTableau(id), 1);

    //supprime la div correspondante au bouton cliqué
    var div_map = document.getElementById("map" + id);
    div_map.parentNode.removeChild(div_map);
    //suppression du tooltip associé a la carte
    var div_tooltip = document.getElementById("tooltip" + id);
    div_tooltip.parentNode.removeChild(div_tooltip);

    //repositionnement des cartes.
    designCarte(tableauCarte[indexTableau(id)]);
}

/**
 * Affiche une nouvelle fenetre (popup) avec les conseils d'utilisation.
 */
function open_infos() {
    var strWindowFeatures = "resizable=yes,scrollbars=yes, top=10, left=10, width=300, height=650";
    window.open('info.html', 'Info', strWindowFeatures);
}

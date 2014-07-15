/**
 * Variable global adaptable par l'utilisateur.
 * Création de l'objet Carte et de l'objet Legende inclu dans Carte.
 *
 * @author Sylvain JARRY
 */
/* variables à adapter par l utilisateur */
var path_json = "data/fond_pays.json"; // chemin du fond de carte JSON rapport au fichier html
var path_csv = "data/donnees.csv"; // chemin des données CSV par rapport au fichier html
var colonne_code = "iso_a2"; // nom de la colonne contenant le code permettant de joindre le fond de carte JSON et les données CSV (ex. : "iso_a2" pour le code ISO 2)
var annees = [2011, 2012, 2013];	// liste des années pour lesquelles il y a des données
var racine_tot = "TOT_";	// nom de la colonne avec nb volontaires totaux, sans l'année ("TOT_" si la colonne s'appelle "TOT_2011" pour 2011, "TOT_2012" pour 2012 etc.)
var racine_sci = "SCI_";	// nom de la colonne avec nb volontaires SCI, sans l'année ("TOT_" si la colonne s'appelle "TOT_2011" pour 2011, "TOT_2012" pour 2012 etc.)
var racine_sve = "SVE_";	// nom de la colonne avec nb volontaires SVE, sans l'année ("TOT_" si la colonne s'appelle "TOT_2011" pour 2011, "TOT_2012" pour 2012 etc.)
var racine_vp = "VP_";	// nom de la colonne avec nb volontaires VP, sans l'année ("TOT_" si la colonne s'appelle "TOT_2011" pour 2011, "TOT_2012" pour 2012 etc.)
var racine_vsi = "VSI_";	// nom de la colonne avec nb volontaires VSI, sans l'année ("TOT_" si la colonne s'appelle "TOT_2011" pour 2011, "TOT_2012" pour 2012 etc.)
var tableauNomDonnee = ["Tous", "SCI", "SVE", "VP", "VSI"]; //tableau contenant les noms de chacune des données, l'ordre doit correspondre à celui de la déclaration des données
var tableauDescription = ["Tous les dispositifs de volontariat sont représentés.",
    "SCI : description",
    "SVE : description",
    "VP : description",
    "VSI : description"
];	//tableau contenant les descriptions pour chaque dispo, l'ordre doit correspondre à celui de la déclaration des variables racine.
var couleur_data = "#ccc";	// couleur des pays avec volontaires
var couleur_nodata = "#eee";	// couleur des pays sans volontaires
var evide = 100;	// nb de volontaires à partir duquel le cercle est évidé
var duree_transition = 1000;	// durée de la transition en millisecondes quand on change de données à afficher
var duree_transition2 = 500;    //durée de la transition lors du repositionnement des cartes.
var Legend_cp = [12, 98, 250, 421]; // liste des valeurs à afficher dans la légende de la carte en cercles proportionnels
var titre_leg = "Légende et explications"; // titre de la légende.
var sous_titre_leg = "Dispositif de volontariat"; //sous titre de la légende.
var type_leg = "Ceci est une carte en cercles proportionnels"; //type de la légende (laisser vide pour supprimer).
var tableauCarte = [];	//tableau contenant tout les objets Cartes.
/*Compteur du nombre de carte créé*/
var compteurCarte = 0;
/* Width and height for the years */
var wy = 960;
var hy = 50;
/* padding pour que les ronds, sur la fleche des années, ne sois pas trop au extrémité */
var padding = 30;
/* élément svg pour les années */
var svg_y = d3.select("#years")
    .append("svg")
    .attr("width", wy)
    .attr("height", hy);
/* crée une échelle pour la représentation des années */
var xScale = d3.scale.linear()
    /* input domain : entre min et max des années */
    .domain([d3.min(annees, function(d) { return d; }), d3.max(annees, function(d) { return d; })])
    /* output range : entre 0 et largeur de l élément, + padding */
    .range([0 + 2*padding, wy - 2*padding]);
/* la projection dans laquelle afficher les données : Robinson */
var projection = d3.geo.robinson()
    .scale(150);
var minzoom = 0.5; //niveau de zoom minimum
var maxzoom = 8; //niveau de zoom maximun
/* On crée un nouvel objet path qui traduit le GeoJSON en SVG */
var path = d3.geo.path()
    .projection(projection);

/**
 * Objet carte. Cet objet comprend tout les parametres associé a une carte.
 * Il est utilisé pour manipuler facilement les cartes dans un tableau de carte.
 *
 * @param id
 *          Identifiant unique de chaque carte.
 * @param Legend
 *          Objet Legende qui comprend les parametres de la légende associés à la carte.
 * @param annee
 *          Année des données de la carte.
 * @param dispo
 *          Type de disposition des données de la carte.
 * @param svg_map
 *          Instance du svg(dessin) de la carte
 * @param cartogroupe
 *          Groupe pour afficher les pays
 * @param planigroupe
 *          Groupe pour afficher le planisphere
 * @param circlegroupe
 *          Groupe pour afficher les cercles proportionnels en fonctions des données.
 * @param isShown
 *          Indique si la carte est déja dessinée ou non
 * @param div_map
 *          balise div dans le html comprenant l'ensemble de la carte(légende+carte)
 * @param div_legend
 *          balise div comprenant la légende
 * @param div_type
 *          balise div comprenant la premiere partie de la légende(titre+type+svg)
 * @param div_dispo
 *          balise div comprenant la deuxieme partie de la légende(sous-titre+description+checkbox)
 * @param div_carte
 *          balise div comprenant le dessin de la carte.
 * @param synchro
 *          Indique si le zoom est synchroniser sur cette carte.
 * @param zoom
 *          Instance zoom spécifique à la carte.
 * @param scaleX
 *          Echelle linéaire d3 sur l'axe X permettant le zoom semantic sur les cercles
 * @param scaleY
 *          Echelle linéaire d3 sur l'axe Y permettant le zoom semantic sur les cercles
 * @param toolTip
 *          Permet l'affichage d'une tooltip lors du click sur un pays. Comprend nom + valeur de donnée.
 * @constructor
 */
function Carte(id, Legend, annee, dispo, svg_map,
               cartogroupe, planigroupe, circlegroupe, isShown, div_map, div_legend,
               div_type, div_dispo, div_carte, synchro, zoom, scaleX, scaleY, toolTip) {

    this.id = id;
    this.Legend = Legend;
    this.annee = annee;
    this.dispo = dispo;
    this.svg_map = svg_map;
    this.cartogroupe = cartogroupe;
    this.planigroupe = planigroupe;
    this.circlegroupe = circlegroupe;
    this.isShown = isShown;
    this.div_map = div_map;
    this.div_legend = div_legend;
    this.div_type = div_type;
    this.div_dispo = div_dispo;
    this.div_carte = div_carte;
    this.synchro = synchro;
    this.zoom = zoom;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.toolTip = toolTip
}

/**
 * Objet légende compris dans la carte, utilisée pour dessiner la légende à coté de la carte.
 * @param titre
 *          Titre de la légende (comprend la premiere partie)
 * @param sousTitre
 *          Sous titre de la légende(comprend la deuxieme partie)
 * @param type
 *          description du type de carte représenté
 * @param donneeLegend
 *          données de la légende.
 * @param description
 *          description des données affichées
 * @param widthLegend
 *          largeur du svg de la légende
 * @param heightLegend
 *          hauteur du svg de la légende
 * @constructor
 */
function Legend(titre, sousTitre, type, donneeLegend, description, widthLegend, heightLegend) {
    this.titre = titre;
    this.sousTitre = sousTitre;
    this.type = type;
    this.donneeLegend = donneeLegend;
    this.description = description;
    this.widthLegend = widthLegend;
    this.heightLegend = heightLegend;
}

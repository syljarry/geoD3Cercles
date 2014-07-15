/**
 * Fonctions permettant de dessiner les cartes après leur mise en page.
 * Dessin des pays, du planisphere (cercle autour représentant la surface du globe) et des cercles.
 * Mise a jour des dessins, utilisé lors du changement de donnée ou d'année.
 *
 * @author Sylvain JARRY
 */


/**
 * Dessine la légende associé à la carte passé en paramètre
 *
 * @param carte
 *              Objet carte pour lequel on dessine la légende
 */
var dessin_Legend = function(carte) {
    /*--------------Premiere partie : titre, type, svg légende--------------------- */
    carte.div_type.append("h2")
        .text(carte.Legend.titre);
    carte.div_type.append("p")
        .text("Ceci est une carte en " + " " + carte.Legend.type);
    //svg pour la légende
    var svg_Legend = carte.div_type.append("svg")
        .attr("width", carte.Legend.widthLegend)
        .attr("height", carte.Legend.heightLegend);
    //groupe g pour la légende
    var legend_groupe = svg_Legend.append("g")
        .attr("class", "leg_cp");

    /* Ajout des cercles de la légende */
    legend_groupe.selectAll("circle")
        .data(carte.Legend.donneeLegend)
        .enter()
        .append("circle")
        /* évide le cercle si sa valeur est supérieure à celle définie par l utilisateur */
        .attr("class", function (d) {
            if (d > evide) {
                return "gros";
            }
        })
        .attr("cx", 40)
        .attr("cy", function (d) {
            return 100 - calc_rayon(d);
        })
        .attr("r", function (d) {
            return calc_rayon(d);
        });

    /* Ajout des lignes de la légende */
    legend_groupe.selectAll("line")
        .data(carte.Legend.donneeLegend)
        .enter()
        .append("line")
        .attr("class", "Legend")
        .attr("x1", 40)
        .attr("y1", function (d) {
            return 100 - 2 * calc_rayon(d);
        })
        .attr("x2", 90)
        .attr("y2", function (d) {
            return 100 - 2 * calc_rayon(d);
        });

    /* affiche les étiquettes de la légende */
    legend_groupe.selectAll("text")
        .data(carte.Legend.donneeLegend)
        .enter()
        .append("text")
        .attr("class", "Legend")
        .text(function (d) {
            return (d);
        })
        .attr("x", 95)
        .attr("y", function (d) {
            return 100 - 2 * calc_rayon(d);
        });

    /*--------------Deuxieme partie : sous-titre, description, checkBox--------------------- */
    carte.div_dispo.append("h2")
        .text(carte.Legend.sousTitre);
    carte.div_dispo.append("p")
        .html("Année : " + carte.annee + "<br/>" + carte.Legend.description);
    //Ajout d'une checkBox pour arreter de syncroniser les zoom
    carte.div_dispo.append("input")
        .attr("type", "checkbox")
        .attr("id", "checkZoom" + carte.id)
        .attr("onclick", "desynchroZoom(" + carte.id + ");");
    carte.div_dispo.append("label")
        .attr("for", "checkZoom" + carte.id)
        .text("Désynchroniser le zoom");

    // Pour résoudre un probleme d'affichage, on applique directement les modification sur la légende dans
    // le cas ou le type d'organisation est "Dessous".
    if(getOrgaLegend() == "Dessous") {
        //Reorganisation de la légende au cas ou elle à été modifiée par d'autre dispostion.
        carte.div_legend
            .style("width", carte.div_carte.style("width"))
            .style("height", 90 + "px")
            .style("visibility", "visible")
            .style("margin-top", (parseFloat(carte.div_carte.style("height")) - 100) + "px");
        carte.div_type.style("height", carte.div_legend.style("height"));
        carte.div_type.select("h2").text(null);
        carte.div_type.select("p").text(null);
        carte.div_type.select("svg").attr("height", 80);
        carte.div_type.select("svg").select("g").attr("transform", "translate(0,-22)");
        carte.div_dispo.select("h2").text(null);
        carte.div_dispo.style("margin-top", 0 + "px")
            .style("margin-left", 170 + "px");
    }
};

/**
 * Met à jour la légende de l'objet carte passer en parametre.
 * Modifie la description.
 *
 * @param carte
 *              Objet carte dont on veut modifier la légende.
 */
var maj_Legend = function(carte) {
    carte.div_dispo.select("p")
        .html("Année : " + carte.annee + "<br/>" + carte.Legend.description);
};

/**
 * Dessine les pays (utilisé pour dessiner la carte la 1ère fois)
 * Associe une couleur différente a un pays si des données le concerne ou non
 *
 * @param json
 *              fichier json comprenant la position des pays
 * @param carte
 *              Objet carte pour lequel on dessine.
 */
var dessin_pays = function (json, carte) {
    /* joint les données (data) dans l ordre du code iso2, qui sert de clé */
    var pays = carte.cartogroupe.selectAll("path")
        .data(json.features, function (d) {
            return d.properties[colonne_code];
        });
    pays.enter()
        .append("path")
        .attr("d", path)
        /* si volontaires pour le pays, ce pays prend une couleur différente */
        .style("fill", function (d) {
            /* Get data value */
            var value = d.properties[carte.dispo + carte.annee];
            if (value) {
                /* If value exists… */
                return couleur_data;
            }
        })
        .on("click", function (d) {
            return toolTipShow(d, carte);
        })
        .on("mouseout", function () {
            return toolTipHide(carte);
        });
    //Fait apparaitre un toolTip indiquant le nom et la valeur du pays auquel il appartient.
    function toolTipShow(d, carte) {
        carte.toolTip.transition()
            .duration(500)
            .style("opacity", 1)
            .text(d.properties.sovereignt + " Valeur : " + d.properties[carte.dispo + carte.annee])
            .style("left", (d3.event.pageX - 38) + "px")
            .style("top", (d3.event.pageY - 43) + "px");
    }
    //Fait disparaitre le toolTip
    function toolTipHide(carte) {
        carte.toolTip.transition()
            .duration(500)
            .style("opacity", 0);
    }
};

/**
 * Mise à jour des pays (avec transition).
 * Change la couleur des pays selon les nouvelles données de l'objet carte.
 *
 * @param json
 *              fichier json comprenant la positions des pays
 * @param carte
 *              Objet carte pour lequel on veut mettre a jour les pays.
 */
var maj_pays = function (json, carte) {
    /* joint les données (data) dans l ordre du code iso2, qui sert de clé */
    var pays = carte.cartogroupe.selectAll("path")
        .data(json.features, function (d) {
            return d.properties[colonne_code];
        });
    pays.transition()
        .duration(duree_transition)
        .attr("d", path)
        /* si volontaires pour le pays, ce pays prend une couleur différente */
        .style("fill", function (d) {
            /* Get data value */
            var value = d.properties[carte.dispo + carte.annee];
            if (value) {
                /* If value exists… */
                return couleur_data;
            } else {
                return couleur_nodata;
            }

        });
};


/**
 *  Dessin des cercles proportionnels (utilisé pour dessiner la carte la 1ère fois)
 *  Affiche des cercles sur chaque pays suivant les données passés en parametre.
 *
 * @param json
 *              fichier json comprenant la positions des pays.
 * @param carte
 *              Objet carte pour lequel on veut dessiner les cercles.
 */
var dessin_cercles = function (json, carte) {
    //desactive les event souris pour afficher correctement le toolTip sur les pays.
    carte.circlegroupe.style("pointer-events", "none");
    /* joint les données (data) dans l ordre du code iso2,
     qui sert de clé (sinon problème car cercles triés ensuite par taille)
     */
    var circles = carte.circlegroupe
        .selectAll("circles")
        .data(json.features, function (d) {
            return d.properties[colonne_code];
        });
    //dessin des cercles.
    var circle = circles.enter();
    circle.append("circle")
        .attr("cx", function (d) {
            var centroid = path.centroid(d);
            return centroid[0];
        })
        .attr("cy", function (d) {
            var centroid = path.centroid(d);
            return centroid[1];
        })
        /* calcule le rayon du cercle pour que la surface varie avec la valeur */
        .attr("r", function (d) {
            var nbvol = d.properties[carte.dispo + carte.annee];
            return calc_rayon(nbvol);
        })
        /* si la valeur est suffisamment importante, vide le cercle pour qu on ne voit que le contour */
        .attr("class", function (d) {
            var value = d.properties[carte.dispo + carte.annee];
            if (value > evide) {
                return "gros";
            }
        })
        .attr("id", "circlemap")
        /* trie les cercles en fonction du nb de vol pour mettre les + petits devant */
        .sort(function (a, b) {
            return b.properties[carte.dispo + carte.annee] - a.properties[carte.dispo + carte.annee];
        });
};

/**
 *  Mise à jour des cercles proportionnels (avec transition)
 *  Change le rayon des cercles suivant les nouvelles données.
 *
 * @param json
 *              fichier json comprenant la positions des pays.
 * @param carte
 *              Objet carte pour lequel on veut mettre a jour les cercles
 */
var maj_cercles = function (json, carte) {
    /* joint les données (data) dans l ordre du code iso2, qui sert de clé (sinon problème car cercles triés ensuite par taille) */
    var circle = carte.circlegroupe.selectAll("circle")
        .data(json.features, function (d) {
            return d.properties[colonne_code];
        });
    /* la suite... */
    circle.transition()
        .duration(duree_transition)
        /* calcule le rayon du cercle pour que la surface varie avec la valeur */
        .attr("r", function (d) {
            var nbvol = d.properties[carte.dispo + carte.annee];
            return calc_rayon(nbvol);
        })
        /* si la valeur est suffisamment importante, vide le cercle pour qu on ne voit que le contour */
        .attr("class", function (d) {
            var value = d.properties[carte.dispo + carte.annee];
            if (value > evide) {
                return "gros";
            }
        })
        /* trie les cercles en fonction du nb de vol pour mettre les + petits devant */
        .sort(function (a, b) {
            return b.properties[dispo + annee] - a.properties[dispo + annee];
        });
};

/**
 * Dessine la carte passée en parametre en appelant les fonctions de dessin, et en
 * ce servant des fichiers de données.
 * Ne dessine les cartes que si elle ne sont pas déjà affichée.
 *
 * @param carte
 *             Objet carte à dessiner
 */
var dessin_carte = function (carte) {

    if (carte.isShown == false) {
        /* affiche le planisphère */
        carte.planigroupe.append("path")
            .datum({type: "Sphere"})
            .attr("class", "plani")
            .attr("id", "sphere")
            .attr("d", path);
        //ajout d'un bouton supprimer et de la liste des noms des données.
        configurationCarte(carte);

        /* Chargement des données CSV */
        d3.csv(path_csv, function (data) {
            /* Chargement des données JSON */
            d3.json(path_json, function (json) {
                /* lie les données CSV pour l année et le dispositif en cours */
                bind_csv_json(data, json, carte.annee, carte.dispo);
                //affiche la légende
                dessin_Legend(carte);
                /* affiche les pays, couleur en fonction année et dispositif en cours */
                dessin_pays(json, carte);
                /* dessine les cercles, en fonction année et dispositif en cours */
                dessin_cercles(json, carte);
                //Synchronise le zoom avec la premiere carte si besoin
                synchroZoom(carte);
            });
        });
        carte.isShown = true;
    }
};

/**
 *  Met à jour la carte passer a paramètre en appelant les fonctions maj, pour la carte
 *  passée en parametre. En regardant dans les fichiers de données.
 *  Appelé lorsque l'on change la disposition des données ou l'année.
 *
 * @param carte
 *              Objet carte que l'on veut mettre à jour.
 */
var maj_carte = function (carte) {
    /* Chargement des données CSV */
    d3.csv(path_csv, function (data) {
        /* Chargement des données JSON */
        d3.json(path_json, function (json) {
            /* lie les données CSV pour l année et le dispositif en cours */
            bind_csv_json(data, json, carte.annee, carte.dispo);

            /* met à jour les pays, couleur en fonction année et dispositif en cours */
            maj_pays(json, carte);

            /* met à jour les cercles, en fonction année et dispositif en cours */
            maj_cercles(json, carte);

        });
    })
};

/**
 * Ajout d'un bouton supprimer et d'une liste pour la selection des données, pour
 * la carte passée en parametre.
 *
 * @param carte
 *          Objet carte sur lequelle appliquer les modifications.
 */
function configurationCarte(carte){
    //création du bouton supprimer, mais pas pour la premiere carte.
    if (compteurCarte != 0) {
        carte.div_carte.append("input")
            .attr("type", "button")
            .attr("value", "Supprimer")
            .attr("id", carte.id)
            .attr("onclick", "suppressionCarte(this.id);");
    }
    ///ajout d'une liste déroulante sur toute les cartes, contient la liste des différentes données disponible.
    var dataSelect = carte.div_carte.append("select")
        .attr("name", "dataSelect")
        .on("change", function(){
            // met à jour la carte avec les nouvelles données selectionnées.
            //on récupere quelle sont les données selectionnées.
            carte.dispo = getDispo(this.options[this.selectedIndex].value);
            carte.Legend.description = getDescription(getDispo(this.options[this.selectedIndex].value));
            //met a jour la légende et la carte correspondante.
            maj_Legend(carte);
            maj_carte(carte);
        });
    //ajout des options pour la liste déroulante.
    for(var i = 0; i<tableauNomDonnee.length; i++) {
        dataSelect.append("option")
            .attr("value", tableauNomDonnee[i])
            .text(tableauNomDonnee[i]);
    }
}

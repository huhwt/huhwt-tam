///////////////////////////////////////////////////////////////////////////////
//
// Topographic Attribute Maps Demo
// Copyright 2020 Reinhold Preiner, Johanna Schmidt, Gabriel Mistelbauer
//
// This code is licensed under an MIT License.
// See the accompanying LICENSE file for details.
//
// i18n functionality added by huhwt
//
///////////////////////////////////////////////////////////////////////////////


// Parameters for Family Graph appearance
var PARAM_RANGE_UNIT_LEN = 3;
var PARAM_FAMILY_NODE_BORDER_COLOR = "#f88";
var PARAM_FAMILY_NODE_BORDER_WIDTH = 10;
var PARAM_FAMILY_FONT_SIZE = 16;
var PARAM_FAMILY_NODE_OPACITY = 0.7;


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


class TFMRenderer extends TAMRenderer
{
    constructor() 
    {
        super();

        this.PNODES = [];
        this.FNODES = [];
        this.LINKNODES = [];
        this.FAMILYLINKS = [];

        this.SVG_FAMILY_CIRCLES = null;
        this.SVG_FAMILY_LABELS = null;

    }

    createFamilyForceGraph(graph, nodePositions = null)
    {
        // list persons
        //----------------------------------
        graph.persons.forEach(p =>
        {
            // set person data
            p.type = "PERSON";
            p.r = PARAM_NODE_RADIUS;
            p.cr = p.sex == FEMALE ? PARAM_NODE_RADIUS : 0;
            p.value = p.bdate ? p.bdate.getFullYear() : null;
            if ( p.value && p.value > this.CurrentYear) {
                p.value = this.CurrentYear;
            }

            p.valueD = p.ddate ? p.ddate.getFullYear() : null;

            // set node positions (if available)
            if (nodePositions && nodePositions[p.id])
            {
                p.x = nodePositions[p.id].x;
                p.y = nodePositions[p.id].y;
                p.vis = { 'x': p.x, 'y': p.y };
                if (nodePositions[p.id].fixed) { // restore fixed state
                    p.fx = p.x;
                    p.fy = p.y;
                }
            }
            else
                p.vis = {'x': 0, 'y': 0};

            this.PNODES.push(p);
        });

        setRange(this.PNODES, this.CurrentYear);
        
        
        // list families
        //----------------------------------
        graph.families.forEach((f, key) =>
        {
            // add family
            f.id = key;
            f.type = "FAMILY";

            // set node positions (if available)
            if (nodePositions && nodePositions[key])
            {
                f.x = nodePositions[key].x;
                f.y = nodePositions[key].y;
                f.vis = { 'x': f.x, 'y': f.y };
                if (nodePositions[key].fixed) { // restore fixed state
                    f.fx = f.x;
                    f.fy = f.y;
                }
            }
            else
                f.vis = {'x': 0, 'y': 0};

            f.familyname = (f.husband && f.husband.surname ? f.husband.surname : (f.wife && f.wife.surname ? f.wife.surname : "")).toUpperCase();

            // Show correct surnames in single-child families (Suggestion Walter Hess)
            //{
            //    f.familyname = "";
            //    if (f.husband && f.husband.surname) f.familyname = f.husband.surname.toUpperCase();
            //    else if (f.children.length == 1)    f.familyname = f.children[0].surname.toUpperCase();
            //}
            
            
            // compute value of this node
            if (f.children.length == 0) {
                f.value = null;
                if (f.husband && f.husband.bdate) f.value = f.husband.bdate.getFullYear();
                if (f.wife && f.wife.bdate && f.wife.bdate.getFullYear() > f.value) f.value = f.wife.bdate.getFullYear();
            }
            else {
                f.value = 1e20;
                f.children.forEach(c => { if (c.bdate && c.bdate.getFullYear() < f.value) f.value = c.bdate.getFullYear(); });
            }
            if (!f.value || f.value === 1e20) {
                f.value = 0;
            }
            
            this.FNODES.push(f);
        });

        // link persons depending on ancestral graph appearance
        //-------------------------------------------------------------
        var LINKS = [];
        this.linkPersonsByFamilyNode(graph, LINKS);
        
        
        // Concat node links participating in force simulation in painter's order
        var NODES = this.FNODES.slice(0);
        this.LINKNODES.forEach(n => NODES.push(n));
        this.PNODES.forEach(n => NODES.push(n));
            
        
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // FORCE SIMULATION OF FORCE-DIRECTED GRAPH

        this.REPULSION_FORCE = d3.forceManyBody().strength(-PARAM_REPULSION_STRENGTH);
        this.LINK_FORCE = d3.forceLink(LINKS).distance(function(d){ return d.distance; }).strength(PARAM_LINK_STRENGTH);
        
        // Initialize force field at the end
        this.FORCE_SIMULATION = d3.forceSimulation(NODES)
            .force("charge", this.REPULSION_FORCE)
            .force("x", d3.forceX(0).strength(PARAM_GRAVITY_X)) 
            .force("y", d3.forceY(0).strength(PARAM_GRAVITY_Y)) 
            .force("similarity", function (alpha) { renderer.similarityForce(renderer.PNODES, alpha); })
            .force("collision", d3.forceCollide().radius(function(d){ return d.r; }))
            .force("link", this.LINK_FORCE)
            .velocityDecay(PARAM_FRICTION)        // friction since d3.v4
            .alpha(PARAM_ALPHA)
            .alphaDecay(0)
            .on("tick", function tick() { renderer.tick(); })
            .on("end", function update() { renderer.updateScalarField(); })
            ;

        if (!PARAM_ENERGIZE) // this parameter may be loaded from an exported save file
            this.FORCE_SIMULATION.alpha(0); // stop simulation

        // ("Force Graph Initialized.");
        console.log(i18n("F_G_I"));

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///  CREATE SVG ELEMENTS

        this.initSVGLayers();
        this.setColorMap();
        
        // bottom layer
        this.SVG_FAMILY_CIRCLES = this.GRAPH_LAYER.selectAll(".family")
            .data(this.FNODES).enter()
            .append("circle")
            .attr("class", "family")
            .style("fill", "fnodeColor")
            .style("stroke", PARAM_FAMILY_NODE_BORDER_COLOR)
            .style("stroke-width", PARAM_FAMILY_NODE_BORDER_WIDTH)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", PARAM_FAMILY_NODE_OPACITY)
            .attr("r", function(f) { return f.r; })
            ;
        
        this.SVG_LINKS = this.GRAPH_LAYER.selectAll(".link")
            .data(this.FAMILYLINKS).enter()
            .append("line")
            .attr("stroke", PARAM_LINK_COLOR)
            .attr("stroke-width", PARAM_LINK_WIDTH + "px")
            .attr("opacity", PARAM_SHOW_LINKS ? PARAM_LINK_OPACITY : 0)
            .attr("marker-end","url(#arrow)")
            ;

        this.SVG_NODE_CIRCLES = this.GRAPH_LAYER.selectAll(".person")
            .data(this.PNODES).enter()
            .append("rect")
            .attr("class", "person")
            .style("fill", function(node) { return typeof(node.value) == "number" ? renderer.SVG_COLORMAP(node.value) : "red"; })
            .style("stroke", "#222")
            .attr("stroke-width", (PARAM_NODE_RADIUS / 4) + "px")
            .attr("width", function (f) { return 2 * f.r; })
            .attr("height", function (f) { return 2 * f.r; })
            .attr("rx", function (f) { return f.cr; })
            .attr("ry", function (f) { return f.cr; })
            ;
        
        if (PARAM_SHOW_NAMES)
            this.showNames();

        // ("SVG Elements Initialized.");
        console.log(i18n("SVG_E_i"));

        // Setup interactions
        this.SVG_DRAGABLE_ELEMENTS = this.GRAPH_LAYER.selectAll(".family,.person");
        initInteractions();
        // ("Interactions Initialized.");
        console.log(i18n("Int_i"));
    }


    linkPersonsByFamilyNode(graph, LINKS)
    {
        //-- link family nodes with children and compute family node radius
        graph.families.forEach(f =>
        {
            const familyDefaultRadius = Math.max(2.5 * PARAM_NODE_RADIUS, Math.sqrt(f.children.length * 9 * PARAM_NODE_RADIUS * PARAM_NODE_RADIUS));
            f.r = familyDefaultRadius;

            f.children.forEach(c => 
            {
                // determine distance of child from family center for visualization of age differences
                c.fnodedist = familyDefaultRadius * 0.5;
                if (c.bdate) c.fnodedist += (c.bdate.getFullYear() - f.value) * PARAM_RANGE_UNIT_LEN;

                // family circle radius has to encompass all childs
                f.r = Math.max(f.r, c.fnodedist);
                
                let link = { "source": f, "target": c, "distance": PARAM_LINK_DISTANCE / 2 };    // division by 2 since there are two segments between family nodes
                LINKS.push(link);

                c.parentFamily = f;
            });
        });

        //-- link family node with parents
        graph.families.forEach(f => 
        {
            let sources = [];
            if (f.husband) sources.push(f.husband);
            if (f.wife) sources.push(f.wife);
            sources.forEach(source => 
            {
                let link = { "source": source, "target": f, "distance": PARAM_LINK_DISTANCE*0.8 + f.r };
                LINKS.push(link);
                this.FAMILYLINKS.push(link);
            });
        });
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    tick()
    {
        // only update visualization each N iterations for performance
        if ((this.tickCounter++) % PARAM_RENDER_UPDATE_INTERVAL)
            return;
            
        
        // set visualization positions of persons by pushing them back into their parent family circle
        this.SVG_NODE_CIRCLES.each(p =>
        {
            // set visualization position to simulation position by default
            p.vis.x = p.x;
            p.vis.y = p.y;

            if (p.parentFamily) 
            {
                if (p.parentFamily.children.length == 1)
                {
                    p.vis.x = p.parentFamily.x;
                    p.vis.y = p.parentFamily.y;
                }
                else
                {
                    let dist = distance(p.vis, p.parentFamily);    // actual distance between node vis positions
                    if (dist > p.fnodedist){
                        let fac = (dist - p.fnodedist) / dist;
                        p.vis.x += (p.parentFamily.x - p.vis.x) * fac;
                        p.vis.y += (p.parentFamily.y - p.vis.y) * fac;
                    }
                }
            }
        });
        
        this.SVG_FAMILY_CIRCLES.each(f => {
            f.vis.x = f.x; 
            f.vis.y = f.y;
        });

            
        // move family and persons circles to defined position (d.x,d.y)
        this.SVG_NODE_CIRCLES.attr("x", function (p) { return p.vis.x - p.r; }).attr("y", function (p) { return p.vis.y - p.r; });
        this.SVG_FAMILY_CIRCLES.attr("cx", function(f) { return f.vis.x; }).attr("cy", function(f) { return f.vis.y; }).attr("r", function(f) { return f.r; });
        
            
        // set links
        this.SVG_LINKS
            .attr("x1", function(d) { return d.source.vis.x; })
            .attr("y1", function(d) { return d.source.vis.y; })
            .attr("x2", function(d) { 
                //if (d.target.type != "FAMILY") return d.targete.x;
                let l = distance(d.source.vis, d.target.vis), t = (l - d.target.r - PARAM_ARROW_DISTANCE_FACTOR * PARAM_ARROW_RADIUS) / l;
                let x = d.source.vis.x * (1-t) + d.target.vis.x * t;
                return isNaN(x) ? d.target.vis.x : x;
            })
            .attr("y2", function(d) { 
                //if (d.target.type != "FAMILY") return d.target.y;
                let l = distance(d.source.vis, d.target.vis), t = (l - d.target.r - PARAM_ARROW_DISTANCE_FACTOR * PARAM_ARROW_RADIUS) / l;  
                let y = d.source.vis.y * (1-t) + d.target.vis.y * t;
                return isNaN(y) ? d.target.vis.y : y;
            })
            ;
        
        // set labels
        if (PARAM_SHOW_NAMES)
        {
            this.SVG_NODE_LABELS.attr("transform", this.placeLabel);
            this.SVG_FAMILY_LABELS.attr("transform", this.placeLabel);
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    hideNames()
    {
        this.SVG_FAMILY_LABELS.remove();
        this.SVG_NODE_LABELS.remove();
    }

    showNames()
    {
        // person labels
        //-----------------------------------------------------------------
        this.SVG_NODE_LABELS = this.GRAPH_LAYER.selectAll(".personlabels")
            .data(this.PNODES).enter()
            .append("text")
            .text(function(node) { return node.givenname; })
            .style("fill", PARAM_LABEL_COLOR)
            .style("stroke", "white")
            .style("stroke-width", PARAM_FONT_SIZE / 5)
            .style("paint-order", "stroke")
            .style("font-family", "Calibri")
            .style("font-size", PARAM_FONT_SIZE)
            .style("pointer-events", "none")  // to prevent mouseover/drag capture
            .style("opacity", PARAM_PERSON_LABEL_OPACITY)
            ;
            
        // compute label lengths and store them
        this.SVG_NODE_LABELS.each(function(d) { d.labelwidth = this.getComputedTextLength(); });
        // now adjust label position based on label lengths
        this.SVG_NODE_LABELS.attr("transform", this.placeLabel);

        
        // family labels
        //-----------------------------------------------------------------
        this.SVG_FAMILY_LABELS = this.GRAPH_LAYER.selectAll(".familylabels")
            .data(this.FNODES).enter()
            .append("text")
            .text(function(d) { return d.familyname; })
            .style("fill", "black")
            .style("stroke", "white")
            .style("stroke-width", PARAM_FAMILY_FONT_SIZE / 5)
            .style("paint-order", "stroke")
            .style("opacity", PARAM_FAMILY_NODE_OPACITY)
            .style("font-family", "Calibri")
            .style("font-size", PARAM_FAMILY_FONT_SIZE)
            .style("pointer-events", "none")  // to prevent mouseover/drag capture
            ;
            
        // compute label lengths and store them
        this.SVG_FAMILY_LABELS.each(function(d) { d.labelwidth = this.getComputedTextLength(); });
        // now adjust label position based on label lengths
        this.SVG_FAMILY_LABELS.attr("transform", this.placeLabel);
    }


    placeLabel(node)
    {
        if (PARAM_PERSON_LABELS_BELOW_NODE)
        {
            // below the node
            let x = node.vis.x - node.labelwidth * 0.5;
            let y = node.vis.y + node.r + 1.0 * PARAM_FONT_SIZE;
            return "translate(" + x + ", " + y + ")";
        }
        else
        {
            // right beside the node
            let x = node.vis.x + 1.5 * node.r;
            let y = node.vis.y + PARAM_FONT_SIZE/4;
            return "translate(" + x + ", " + y + ")";
        }
    }

    // Update function for scalar field and associated contour map
    updateScalarField()
    {
        // remove old paths        
        this.resetScalarField();
        
        //--- 1. List height field constraints
        let topopoints = [];

        // add constraints at person positions
        this.PNODES.forEach(p =>    {
            if (isNumber(p.value)) topopoints.push({ 'x' : p.vis.x, 'y': p.vis.y, 'value' : p.value });
            if (isNumber(p.valueD)) topopoints.push({ 'x' : p.vis.x, 'y': p.vis.y, 'value' : p.valueD });
        });
            
        // Create Topopoints for Family Links
        if (PARAM_EMBED_LINKS)
        {
            this.FAMILYLINKS.forEach(link => {
                if (link.source.value && link.target.value) {
                    let pv0 = new vec(link.source.vis.x, link.source.vis.y, link.source.value);
                    let pv1 = new vec(link.target.vis.x, link.target.vis.y, link.target.value);
                    let v = pv1.sub(pv0);
                    let nsteps = v.norm() / PARAM_LINK_SAMPLE_STEPSIZE;
                    if (nsteps > 0) {
                        v = v.div(nsteps);
                        for (let i = 0, pv = pv0; i < nsteps; i++, pv = pv.add(v))
                            topopoints.push({ 'x' : pv.x, 'y': pv.y, 'value' : pv.z });
                    }
                }
            });
        }
        
        //--- 2. Create scalar field
        // (topopoints.length, " Topopoints");
        console.log(i18n("Top_l", { ptpl: topopoints.length } ));
        var SCALARFIELD = new TopoMap(topopoints, PARAM_SF_INTERPOLATION_TYPE, PARAM_SCALARFIELD_RESOLUTION, PARAM_SCALARFIELD_DILATION_ITERS);
                
        
        //--- 3. Create tunnels and overlays
        if (PARAM_SHOW_TUNNELS)
        {
            // ("Creating Tunnels");
            console.log(i18n("Cre_T"));
            this.SVG_LINKS.attr("opacity", 0);  // make the other links invisible

            let SEGMENTS = [];
            this.FAMILYLINKS.forEach(link =>
            {
                if (link.source.value && link.target.value)
                {
                    // determine 2D start and endpoint on map, respecting some offsets
                    let pv0 = new vec(link.source.vis.x, link.source.vis.y, link.source.value);
                    let pv1 = new vec(link.target.vis.x, link.target.vis.y, link.target.value);
                
                    SEGMENTS.push({ 'pv0': pv0, 'pv1': pv1, 'directed': true, 'r1': link.target.r });
                }
            });
            
            // create tunnels
            this.createTunnels(SCALARFIELD, SEGMENTS);


            if (this.SVG_NODE_CIRCLES) this.SVG_NODE_CIRCLES.raise();    
            //if (this.SVG_FAMILY_CIRCLES) this.SVG_FAMILY_CIRCLES.raise();    // needs to stay below links
            if (this.SVG_NODE_LABELS) this.SVG_NODE_LABELS.raise();
            if (this.SVG_FAMILY_LABELS) this.SVG_FAMILY_LABELS.raise();
        }
        else
        {
            this.SVG_LINKS_STREETS.attr("opacity", 0);
            this.SVG_LINKS_TUNNELS.attr("opacity", 0);
            this.SVG_TUNNEL_ENTRIES_1.attr("opacity", 0);
            this.SVG_TUNNEL_ENTRIES_2.attr("opacity", 0);
            this.SVG_LINKS.attr("opacity", PARAM_SHOW_LINKS ? PARAM_LINK_OPACITY : 0)
                          .attr("stroke-width", PARAM_LINK_WIDTH + "px")
                          ;
        }


        this.addHeightfieldOverlays(SCALARFIELD);
    
        // ("+++ Done Updating ScalarField");
        console.log(i18n("Done_uSF"));
    }

    // Returns a string representation of the node to be used in tooltips
    getNodeAttributesAsString(node)
    {
        let _unknown = i18n("unknown");
        if (node.type == "PERSON")
        {
            const age = node.bdate && node.ddate
                ? Math.floor((node.ddate - node.bdate) / 31536000000) // 1000ms * 60s * 60min * 24h * 365d
                : _unknown;
            const mother = node.getMother();
            const father = node.getFather();

            return node.getFullName() + (node.id ? " (" + node.id + ")" : "")
                    + "\n\n" + i18n("birth") + (node.bdate ? node.bdate.toLocaleDateString() : _unknown)
                    + "\n" + i18n("death") + (node.ddate ? node.ddate.toLocaleDateString() : _unknown)
                    + "\n" + i18n("age") + age
                    + "\n" + i18n("mother") + (mother ? mother.getFullName() + " (" +  mother.id + ")" : _unknown)
                    + "\n" + i18n("father") + (father ? father.getFullName() + " (" +  father.id + ")" : _unknown)
                    ;
        }
        else if (node.type == "FAMILY")
        {
            const wife = node.wife;
            const husband = node.husband;
            const mdate = node.mdate;

            return node.familyname + (node.id ? " (" + node.id + ")" : "")
                    + "\n\n" + i18n("wife") + (wife ? wife.getFullName() + " (" + wife.id + ")" : _unknown)
                    + "\n" + i18n("husband") + (husband ? husband.getFullName() + " (" + husband.id + ")" : _unknown)
                    + "\n" + i18n("marriage") + (mdate ? node.mdate.toLocaleDateString() : _unknown)
                    + "\n" + i18n("children") + (node.children ? node.children.length : _unknown)
                    + "\n" + i18n("Fchild") + (node.value ? node.value : _unknown)
                    ;
        }
        else
        {
            return _unknown;
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    saveData()
    {
        // store person/family node positions with their id
        let nodePositions = {};
        this.PNODES.forEach(p => { nodePositions[p.id] = {"x": p.x, "y": p.y, "fixed": p.fx != null}; });
        this.FNODES.forEach(f => { nodePositions[f.id] = {"x": f.x, "y": f.y, "fixed": f.fx != null}; });

        let content = [JSON.stringify(
            {
                "metadata": getMetadata(),
                "parameters": getParameters(),
                "nodePositions": nodePositions,
            },
            null, 2)]; // no replacement function, human readable indentation
        let blob = new Blob(content, { type: "text/json" });
        let filenameWithoutSuffix = PARAM_FILENAME.slice(0, PARAM_FILENAME.lastIndexOf('.'));

        createDownloadFromBlob(blob, filenameWithoutSuffix + ".tfm");
    }
}

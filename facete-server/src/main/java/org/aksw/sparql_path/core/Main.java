package org.aksw.sparql_path.core;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.sql.DataSource;

import org.aksw.commons.util.StreamUtils;
import org.aksw.jena_sparql_api.core.QueryExecutionFactory;
import org.aksw.jena_sparql_api.http.QueryExecutionFactoryHttp;
import org.aksw.jena_sparql_api.model.QueryExecutionFactoryModel;
import org.aksw.jena_sparql_api.utils.QuadUtils;
import org.aksw.sparqlify.core.ReplaceConstants;
import org.aksw.sparqlify.core.algorithms.GeneratorBlacklist;
import org.aksw.sparqlify.util.SparqlifyUtils;
import org.jgrapht.graph.DefaultEdge;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import com.google.common.base.Function;
import com.hp.hpl.jena.graph.Node;
import com.hp.hpl.jena.graph.Triple;
import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.RDFNode;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.sdb.core.Generator;
import com.hp.hpl.jena.sdb.core.Gensym;
import com.hp.hpl.jena.sparql.algebra.Algebra;
import com.hp.hpl.jena.sparql.algebra.Op;
import com.hp.hpl.jena.sparql.algebra.op.OpFilter;
import com.hp.hpl.jena.sparql.algebra.op.OpProject;
import com.hp.hpl.jena.sparql.algebra.op.OpQuadPattern;
import com.hp.hpl.jena.sparql.core.BasicPattern;
import com.hp.hpl.jena.sparql.core.Quad;
import com.hp.hpl.jena.sparql.core.TriplePath;
import com.hp.hpl.jena.sparql.core.Var;
import com.hp.hpl.jena.sparql.engine.binding.Binding;
import com.hp.hpl.jena.sparql.expr.E_Equals;
import com.hp.hpl.jena.sparql.expr.ExprList;
import com.hp.hpl.jena.sparql.expr.ExprVar;
import com.hp.hpl.jena.sparql.syntax.Element;
import com.hp.hpl.jena.sparql.syntax.ElementFilter;
import com.hp.hpl.jena.sparql.syntax.ElementGroup;
import com.hp.hpl.jena.sparql.syntax.ElementPathBlock;
import com.hp.hpl.jena.sparql.syntax.ElementTriplesBlock;
import com.hp.hpl.jena.sparql.syntax.PatternVars;
import com.hp.hpl.jena.util.iterator.ExtendedIterator;
import com.hp.hpl.jena.util.iterator.Map1;

class EdgeTransition
	extends DefaultEdge
{
	public EdgeTransition() {
	}
}

class VocabPath {
	public static final Resource start = ResourceFactory.createProperty("http://foo.bar/start");
	public static final Property connectsTo = ResourceFactory.createProperty("http://foo.bar/connectsTo");
}

class QueryExecutionUtils {
	public static List<Node> executeList(QueryExecutionFactory qef, Query query) {
		List<Node> result = new ArrayList<Node>();
		
		List<Var> vars = query.getProjectVars();
		if(vars.size() != 1) {
			throw new RuntimeException("Exactly 1 var expected");
		}
		
		Var var = vars.get(0);
		
		QueryExecution qe = qef.createQueryExecution(query);
		ResultSet rs = qe.execSelect();
		while(rs.hasNext()) {
			//QuerySolutiors.next()
			Binding binding = rs.nextBinding();
			Node node = binding.get(var);
			
			result.add(node);
		}
		
		return result;
	}
}

class PathCallbackList
	implements PathCallback
{
	private List<Path> candidates = new ArrayList<Path>();
	
	@Override
	public void handle(Path path) {
		candidates.add(path);
	}
	
	public List<Path> getCandidates() {
		return candidates;
	}
};


/**
 * Just some idea:
 * The property matrix query might not run on DBpedia (we have to try out), BUT:
 * 
 * First, we can partition by graph.
 * Then, we can fetch all properties
 *     We could even use a partitioned approach for this step.
 *
 * Afterwards, we could take each individual property, and try to find all
 * successor properties of it, e.g.
 * 
 * Select Distinct ?y {
 *         { Select * { -- See Note [1]
 *     ?a ?x ?b .
 *     Filter(?x = <foobar>)
 *         } Limit 100000 Offset 10000 }
 *
 *     ?b ?y ?c .
 * }
 * 
 * [1] Note: we could do Distinct ?b, but it might not improve performance (much), as ?b will have few duplicates
 * 
 *
 *
 * @author raven
 *
 */
class PropertySummaryCreator {
	
}


class Context {
	private Node graphNode = Quad.defaultGraphNodeGenerated;

	public Context() {
		super();
	}

	public Node getGraphNode() {
		return graphNode;
	}

	public void setGraphNode(Node graphNode) {
		this.graphNode = graphNode;
	}
	
	
}

class PathConstraint {
	
	private static final Logger logger = LoggerFactory.getLogger(PathConstraint.class);
	
	public static void getPathConstraints(Concept concept) {
		
		Query query = concept.asQuery();
		
		Op op = Algebra.compile(query);
		op = Algebra.toQuadForm(op);		
		
		op = ReplaceConstants.replace(op);
		
		/*
		ExprList exprs = FilterUtils.collectExprs(op, new ExprList());
		Collection<Quad> quads =  PatternUtils.collectQuads(op, new ArrayList<Quad>());

				
		List<ExprList> clauses = DnfUtils.toClauses(exprs);
		System.out.println("DNF = " + clauses);

		Set<Set<Expr>> dnf = FilterUtils.toSets(clauses);
		
		System.out.println("aaoeuaoeutsh");
		*/
	}

	public static List<Quad> collectQuads(Element element) {
		List<Quad> result = new ArrayList<Quad>();
		Context context = new Context();
		
		collectQuads(element, context, result);
		
		return result;
	}

	
	public static void collectQuads(Element element, Context context, List<Quad> result) {
		if(element instanceof ElementTriplesBlock) {
			collectQuads((ElementTriplesBlock)element, context, result);
		}
		else if(element instanceof ElementGroup) {
			collectQuads((ElementGroup)element, context, result);
		}
		else if(element instanceof ElementPathBlock) {
			collectQuads((ElementPathBlock)element, context, result);
		}
		else {
			logger.warn("Omitting unsupported element type: " + element.getClass() + " - " + element);
		}
	}
	
	public static void collectQuads(ElementTriplesBlock element, Context context, List<Quad> result) {
		Node graphNode = context.getGraphNode();
		
		for(Triple triple : element.getPattern().getList()) {
			Quad quad = new Quad(graphNode, triple);
			result.add(quad);
		}
	}
	
	public static void collectQuads(ElementGroup element, Context context, List<Quad> result) {
		for(Element e : element.getElements()) {
			collectQuads(e, context, result);
		}
	}

	public static void collectQuads(ElementPathBlock element, Context context, List<Quad> result) {
		Node graphNode = context.getGraphNode();
		
		for(TriplePath triplePath : element.getPattern().getList()) {
			Triple triple = triplePath.asTriple();
			
			if(triple == null) {
				logger.warn("Omitted non-simple triple");
			}
			
			Quad quad = new Quad(graphNode, triple);
			result.add(quad);
		}
	}

	
	public static void getPathConstraints(OpProject op) {
		
	}

	public static void getPathConstraints(OpFilter op) {
		ExprList exprs = op.getExprs();
		
		
		
	}
	
	public static void getPathConstraints(OpQuadPattern op) {
	
	}
	
	public static final String varNs = "http://dummy.org/var/";
	
	public static Var uriToVar(Node node) {
		Var result = null;
		
		if(node.isVariable()) {
			result = (Var)node;
		}
		else if(node.isURI()) {
			String tmp = node.getURI();
			if(tmp.startsWith(varNs)) {
				String suffix = tmp.substring(varNs.length());
				
				result = Var.alloc(suffix);
			}
		}
		
		return result;
	}
	
	public static Node createVarUri(Var var) {
		return Node.createURI(varNs + var.getName());
	}
	
	public static Quad createUriVars(Quad quad) {
		List<Node> tmp = new ArrayList<Node>(4);
		
		for(Node node : QuadUtils.quadToList(quad)) {
			Node x = node;
			if(node.isVariable()) {
				x = createVarUri((Var)node); 				
			}
			
			tmp.add(x);
		}
		
		Quad result = QuadUtils.listToQuad(tmp);
		return result;
	}

	public static Concept getPathConstraintsSimple(Concept concept) {
		Model model = ModelFactory.createDefaultModel();


		List<Quad> quads = collectQuads(concept.getElement());
		
		for(Quad quad : quads) {
			// Replace variables with fake uris
			Quad q = createUriVars(quad);
			
			Statement stmt = model.asStatement(q.asTriple());
			model.add(stmt);
		}
		
	
		//Node s = createVarUri(concept.getVar());
		//Resource start = model.asRDFNode(s).asResource();
		
		Set<Triple> result = new HashSet<Triple>();
		createQueryForward(model, concept.getVar(), VocabPath.start, result);
		createQueryBackward(model, concept.getVar(), VocabPath.start, result);
		
		BasicPattern bgp = BasicPattern.wrap(new ArrayList<Triple>(result));
		ElementTriplesBlock triplesBlock = new ElementTriplesBlock(bgp); 
		
		Concept c = new Concept(triplesBlock, concept.getVar());
		
		
		System.out.println("Path query is: " + c);
		
		return c;
	}


	public static void createQueryForward(Model model, Node node, Resource res, Set<Triple> result) {
		Node n;
		if(node.isVariable()) {
			n = createVarUri((Var)node);
		} else {
			n = node;
		}
		
		Resource r = model.asRDFNode(n).asResource();

		
		Set<Statement> succs = model.listStatements(r, null, (RDFNode)null).toSet();

		
		for(Statement stmt : succs) {
			RDFNode oo = stmt.getObject();
			if(!oo.isURIResource()) {
				continue;
			}

			Property p = stmt.getPredicate();
			Resource o = oo.asResource();
		
			Triple t = new Triple(node, VocabPath.connectsTo.asNode(), p.asNode());
			if(!result.contains(t)) {			
				result.add(t);
				createQueryForward(model, o.asNode(), p.asResource(), result);
			}
		}
	}		
	
	public static void createQueryBackward(Model model, Node node, Resource res, Set<Triple> result) {
		Node n;
		if(node.isVariable()) {
			n = createVarUri((Var)node);
		} else {
			n = node;
		}
		
		Resource r = model.asRDFNode(n).asResource();

		Set<Statement> preds = model.listStatements(null, null, r).toSet();
		for(Statement stmt : preds) {
			Resource s = stmt.getSubject();
			Property p = stmt.getPredicate();
		
			Triple t = new Triple(p.asNode(), VocabPath.connectsTo.asNode(), node);
			if(!result.contains(t)) {
				result.add(t);
				createQueryBackward(model, s.asNode(), p.asResource(), result);
			}
		}
	}

}

public class Main {
	
	
	
	public static void main(String[] args) throws IOException, SQLException {
		QueryExecutionFactory qef = new QueryExecutionFactoryHttp("http://localhost:8810/sparql", "http://fp7-pp.publicdata.eu/");
				

		Concept sourceConcept = Concept.create("?s a <http://fp7-pp.publicdata.eu/ontology/Project>", "s");
		System.out.println(sourceConcept);

		Concept tmpTargetConcept = Concept.create("?s <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?lon ; <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?lat", "s");
	
		findPaths(qef, sourceConcept, tmpTargetConcept);
	}
	
	public static List<Path> findPaths(QueryExecutionFactory qef, Concept sourceConcept, Concept tmpTargetConcept)
	{
		String queryStr = "Select Distinct ?x ?y { ?a ?x ?b . ?b ?y ?c }";
		QueryExecution qe = qef.createQueryExecution(queryStr);
		ResultSet rs = qe.execSelect();

		
		Concept targetConcept = tmpTargetConcept.makeDistinctFrom(sourceConcept);
		
		System.out.println("Distinguished target concept: " + targetConcept);
		

		PathConstraint.getPathConstraintsSimple(targetConcept);
		
		//UndirectedGraph<String, EdgeTransition> transitionGraph = new SimpleGraph<String, EdgeTransition>(EdgeTransition.class);

		Model transitionModel = ModelFactory.createDefaultModel();
		
		while(rs.hasNext()) {
			QuerySolution qs = rs.next();
			
			Resource x = qs.getResource("x");
			Resource y = qs.getResource("y");
			
			transitionModel.add(x, VocabPath.connectsTo, y);
			
			
//			String x = qs.get("x").asNode().getURI();
//			String y = qs.get("y").asNode().getURI();

			
			
			//System.out.println(x + "   " + y);
			//transitionGraph.addVertex(arg0);
		}
		System.out.println("Transition model contains " + transitionModel.size() + " triples");
		
		
		// Retrieve properties of the source concept
		// Example: If our source concept is ?s a Type", we do not know which properties the concept has

		Concept propertyConcept = QueryGenerationUtils.createPropertyQuery(sourceConcept);
		Query propertyQuery = propertyConcept.asQuery();
		System.out.println(propertyQuery);


		List<Node> nodes = QueryExecutionUtils.executeList(qef, propertyQuery);
		System.out.println(nodes);

		
		// Add the start node to the transition model
		for(Node node : nodes) {
			Triple triple = new Triple(VocabPath.start.asNode(), VocabPath.connectsTo.asNode(), node);

			Statement stmt = transitionModel.asStatement(triple);
			transitionModel.add(stmt);
		}
		
		QueryExecutionFactory qefMeta = new QueryExecutionFactoryModel(transitionModel);
		
		// Now transform the target query so the find candidate nodes in the transition graph
		
		// Essentially:
		// ?moo prop1 ?foo . ?foo prop 2 ?bar .
		// becomes
		// Select ?s { ?s connectsTo ?prop1 . ?prop1 connectsTo ?foo }
		// In other words: we take the target concept, extract all quads
		
		//String test = "Prefix o:<http://foo.bar/> Prefix geo:<http://www.w3.org/2003/01/geo/wgs84_pos#> Select ?s { ?s o:connectsTo geo:long ; o:connectsTo geo:lat }";

		Concept targetCandidateConcept = PathConstraint.getPathConstraintsSimple(targetConcept);
		Query targetCandidateQuery = targetCandidateConcept.asQuery();
		
		//Query query = QueryFactory.create(test);
		List<Node> candidates = QueryExecutionUtils.executeList(qefMeta, targetCandidateQuery);
		System.out.println("Candidates: " + candidates);

		
		// Now that we know the candidates, we can start with out breath first search
		
		//DataSource ds = BreathFirstTask.createDb();
		
		
		PathCallbackList callback = new PathCallbackList();

		for(Node candidate : candidates) {
			Resource dest = transitionModel.asRDFNode(candidate).asResource();
			
			
			
			NeighborProvider<Resource> np = new NeighborProviderModel(transitionModel);

			BreathFirstTask.run(np, VocabPath.start, dest, new ArrayList<Step>(), callback);
			//BreathFirstTask.runFoo(np, VocabPath.start, dest, new ArrayList<Step>(), new ArrayList<Step>(), callback);
		}
		
		
		List<Path> paths = callback.getCandidates();
		
		// Cross check whether the path actually connects the source and target concepts
		Set<String> varNames = new HashSet<String>();
		varNames.addAll(VarUtils.getVarNames(PatternVars.vars(sourceConcept.getElement())));
		varNames.addAll(VarUtils.getVarNames(PatternVars.vars(targetConcept.getElement())));
		
		Generator generator = GeneratorBlacklist.create(Gensym.create("v"), varNames);
		
		List<Path> result = new ArrayList<Path>();
		
		for(Path path : paths) {
			List<Element> pathElements = Path.pathToElements(path, sourceConcept.getVar(), targetConcept.getVar(), generator);
			
			List<Element> tmp = new ArrayList<Element>();
			tmp.addAll(sourceConcept.getElements());
			tmp.addAll(targetConcept.getElements());
			tmp.addAll(pathElements);

			if(pathElements.isEmpty()) {
				if(!sourceConcept.getVar().equals(targetConcept.getVar())) {
					tmp.add(new ElementFilter(new E_Equals(new ExprVar(sourceConcept.getVar()), new ExprVar(targetConcept.getVar()))));
				}
			}

			ElementGroup group = new ElementGroup();
			for(Element t : tmp) {
				group.addElement(t);
			}
			
			Query query = new Query();
			query.setQueryAskType();
			query.setQueryPattern(group);
			
			System.out.println(query);
			
			QueryExecution xqe = qef.createQueryExecution(query);
			boolean isCandidate = xqe.execAsk();
			System.out.println("Ask result: " + isCandidate);
			
			if(isCandidate) {
				result.add(path);
			}
		}
		
		return result;
	}
	
}


class Map1StatementToSubject
	implements Map1<Statement, Resource>
{
	@Override
	public Resource map1(Statement stmt) {
		return stmt.getSubject().asResource();
	}	
}

class Map1StatementToObject
	implements Map1<Statement, Resource>
{
	@Override
	public Resource map1(Statement stmt) {
		return stmt.getObject().asResource();
	}	
}

// TODO Don't like this right now: The iterator should return steps I guess....
interface NeighborProvider<T> {
	ExtendedIterator<T> getSuccessors(T r);
	ExtendedIterator<T> getPredecessors(T r);
}

class NeighborProviderModel
	implements NeighborProvider<Resource>
{
	private Model model;

	public static ExtendedIterator<Resource> createForwardIterator(Model model, Resource start) {
		// For the current resource, get all possible outgoing paths
		ExtendedIterator<Statement> itTmp = model.listStatements(start, VocabPath.connectsTo, (RDFNode)null);
		ExtendedIterator<Resource> result = itTmp.mapWith(new Map1StatementToObject());
		
		return result;
	}
	
	public static ExtendedIterator<Resource> createBackwardIterator(Model model, Resource start) {
		// For the current resource, get all possible outgoing paths
		ExtendedIterator<Statement> itTmp = model.listStatements(null, VocabPath.connectsTo, start);
		ExtendedIterator<Resource> result = itTmp.mapWith(new Map1StatementToObject());
		
		return result;
	}

	
	public NeighborProviderModel(Model model) {
		this.model = model;
	}

	@Override
	public ExtendedIterator<Resource> getSuccessors(Resource r) {
		return createForwardIterator(model, r);
	}

	@Override
	public ExtendedIterator<Resource> getPredecessors(Resource r) {
		return createBackwardIterator(model, r);
	}
}




/**
 * There is a callback for getting notified about found paths.
 * 
 * @author raven
 *
 */
class BreathFirstTask {
	private Model model;
	
	private Node a;
	private Node b;
	
	private Set<Resource> sourceFront;
	private Set<Resource> targetFront;
	
	private Function<Void, Void> callback;
	
	public BreathFirstTask()
	{
	}


	public static ExtendedIterator<Resource> createForwardIterator(Model model, Resource start) {
		// For the current resource, get all possible outgoing paths
		ExtendedIterator<Statement> itTmp = model.listStatements(start, VocabPath.connectsTo, (RDFNode)null);
		ExtendedIterator<Resource> result = itTmp.mapWith(new Map1StatementToObject());
		
		return result;
	}


	public static ExtendedIterator<Resource> createBackwardIterator(Model model, Resource start) {
		// For the current resource, get all possible outgoing paths
		ExtendedIterator<Statement> itTmp = model.listStatements(null, VocabPath.connectsTo, start);
		ExtendedIterator<Resource> result = itTmp.mapWith(new Map1StatementToObject());
		
		return result;
	}
	
	public static void run(NeighborProvider<Resource> np, Resource start, Resource dest, List<Step> steps, PathCallback callback) {
		
		if(start.equals(dest)) {
			// emit empty path
			callback.handle(new Path(steps));
			return;
		}

		if(steps.size() > 10) {
			return;
		}

		// Note: There is 2x2 possibilities per step:
		// .) we move forward from the source / backward from the dest
		// .) we move backward from the source / forward to the dest
		
		
		// The decision on whether to start from the front or the back can depend on which node leads to
		// fewer options
		Set<Resource> succs = np.getSuccessors(start).toSet();
		for(Resource succ : succs) {
			List<Step> tmp = new ArrayList<Step>(steps);
			
			Step s = new Step(succ.getURI(), false);
			tmp.add(s);
			
			run(np, succ, dest, tmp, callback);
		}

	}


	public static void runFoo(NeighborProvider<Resource> np, Resource start, Resource dest, List<Step> startSteps, List<Step> destSteps, PathCallback callback) {
		
		List<Step> steps = null;
		
		if(start.equals(dest)) {
			// emit empty path
			callback.handle(new Path(steps));
		}

		if(startSteps.size() + destSteps.size() > 10) {
			return;
		}

		// Note: There is 2x2 possibilities per step:
		// .) we move forward from the source / backward from the dest
		// .) we move backward from the source / forward to the dest
		
		
		// The decision on whether to start from the front or the back can depend on which node leads to
		// fewer options
		Set<Resource> succs = np.getSuccessors(start).toSet();
		Set<Resource> preds = np.getPredecessors(dest).toSet();

		
		if(preds.size() < succs.size()) {
			
			
			
		}
		
		// NOTE: We could now take the smaller set to make another step

		for(Resource succ : succs) {
			List<Step> tmp = new ArrayList<Step>(steps);
			
			Step s = new Step(succ.getURI(), false);
			tmp.add(s);

			/*
			if(succ.equals(dest)) {
				callback.handle(new Path(new ArrayList<Step>(tmp)));
			}*/
			
			//run(np, succ, dest, tmp, callback);
		}
		
		
		for(Resource pred : preds) {
			
		}
		
	}
	
	
	

	/*
	public static isSolution() {
		
	}
	*/
	
	public static DataSource createDb() throws IOException, SQLException {
		DataSource ds = SparqlifyUtils.createDefaultDatabase("paths");

		PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
		org.springframework.core.io.Resource r = resolver.getResource("paths.sql");
		
		InputStream in = r.getInputStream();
		String str = StreamUtils.toStringSafe(in);
		
		Connection conn = ds.getConnection();
		try {
			conn.createStatement().executeUpdate(str);
		}
		finally {
			conn.close();
		}
		
		return ds;
	}
	
	public static void doSomething(Model model, Resource start, Resource end) {

		Set<Resource> visited = new HashSet<Resource>();
		
		Resource current = null;		
		visited.add(current);

		}
		
		
//		// Go forward and backward from the current concept
//		// The take step function checks 
//		takeStep(a, false);
//		takeStep(a, true);
//
//		takeStep(b, false);
//		takeStep(b, true);
//
//		
//		
//		
//		while(it.hasNext()) {
//			Resource node = it.next();
//		}
		
//	}
}

/*
 * Note: Dijkstra would only keep the shortest path to a node - but here we want all paths...
 * 
 * 
 * Schema:
 * context: The id of the path segement
 * in_inverse: whether this node was reached by forward or backward traversal
 * path_length: accumulated path length
 * 
 * cost: some meta data..., for example, how many forward / backwards traks were used
 * 
 * Path "Fact" table:
 * TODO I guess the segment_id is globally unique...
 * 
 * process_id | ant_id | segment_id | context_id | to_node_id | is_inverse | path_length | backward_step_count |
 *          X |      1 |          1 |       null |        foo |      false |           0 |                   0 |
 *                                2 |          1 |        bar |        baz |           1 |                   0 |
 *
 * Solution Cache:
 * We can track which paths were found between two nodes, but we also need a completeness level,
 * i.e. whether all paths of e.g. length 1, 2, 3, ... have been found.
 * If yes, then we can make full use of the cache, otherwise, we need to scan whether there
 * are paths which have not been checked.
 * This on the other hand means, that we could have to keep track of
 * - which paths have not been seen yet (because the iteration was not far enough yet)
 * - which paths have been skipped, e.g. because their cost estimate was too high.
 * 
 * 
 * 
 * Maintaining this minimum path matrix would require N^2 space...
 * With ~50000 properties on DBpedia, there is no point to pre-compute this, but only cache results
 * of on-demand computations.
 * 
 * 
 * A shortest path cache:
 * This could help estimating, whether 2 nodes are connected at all, and what would be their shortest route.
 * 
 * Somehow this begs the question of what pg_routing actually does...
 * Anyway, a pure Java solution is preferred...
 * 
 * Path "Cache" table:
 * start_node_id | end_node_id | 
 * 
 * 
 * Questions:
 * 
 * We could start caching paths between nodes after a certain length!
 * 
 * 
 * So, when we search for paths between nodes, we ask an "Edge-Provider" for all outgoing edges.
 * We could then keep track of whether the edge provider was done or not with the provisioning.
 *    -> state + done flag needed
 *    
 * 
 * 
 * 
 * How to figure out that two paths meet:
 * If one ant either reaches a goal node (to_node_id is a goal) or
 * to_node_id was reached by another ant
 * 
 * Problem with this approach:
 * We do not keep track of sub-solutions -> bad!
 * 
 *
 * Property adjacency retrieval:
 * This is in the general case some kind of partitioned query execution....
 * 
 */




package org.aksw.semmap.web;

import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import javax.servlet.ServletContext;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.StreamingOutput;

import org.aksw.commons.sparql.api.cache.core.QueryExecutionFactoryCacheEx;
import org.aksw.commons.sparql.api.cache.extra.CacheCoreEx;
import org.aksw.commons.sparql.api.cache.extra.CacheCoreH2;
import org.aksw.commons.sparql.api.cache.extra.CacheEx;
import org.aksw.commons.sparql.api.cache.extra.CacheExImpl;
import org.aksw.commons.sparql.api.core.QueryExecutionFactory;
import org.aksw.commons.sparql.api.core.QueryExecutionStreaming;
import org.aksw.commons.sparql.api.http.QueryExecutionFactoryHttp;
import org.aksw.commons.sparql.api.pagination.core.QueryExecutionFactoryPaginated;
import org.openjena.atlas.lib.Sink;
import org.openjena.riot.out.SinkTripleOutput;

import au.com.bytecode.opencsv.CSVWriter;

import com.hp.hpl.jena.graph.Node;
import com.hp.hpl.jena.graph.Triple;
import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.sparql.core.BasicPattern;
import com.hp.hpl.jena.sparql.core.TriplePath;
import com.hp.hpl.jena.sparql.core.Var;
import com.hp.hpl.jena.sparql.syntax.Element;
import com.hp.hpl.jena.sparql.syntax.ElementFilter;
import com.hp.hpl.jena.sparql.syntax.ElementGroup;
import com.hp.hpl.jena.sparql.syntax.ElementOptional;
import com.hp.hpl.jena.sparql.syntax.ElementPathBlock;
import com.hp.hpl.jena.sparql.syntax.ElementTriplesBlock;
import com.hp.hpl.jena.sparql.syntax.Template;


/**
 * Jersey resource for the QA Dashboard transition backend.
 * 
 * @author Claus Stadler <cstadler@informatik.uni-leipzig.de>
 *
 */
@Path("/service")
//@Produces("application/rdf+xml")
//@Produces("text/plain")
public class RestService {

	
	/**
	 *  
	 * @param context The servlet context.
	 */
	public RestService(@Context ServletContext context) {
	}
	
	
	public static Set<Triple> getTriplesByVar(Var var, Collection<Triple> triples)
	{
		Set<Triple> result = new HashSet<Triple>();
		for(Triple triple : triples) {
			if(containsVar(triple, var)) {
				result.add(triple);
			}
		}
		
		return result;
	}
	
	public static Query selectToConstruct(Query query) {
		Set<Triple> triples = getTriples(query);
		BasicPattern bgp = new BasicPattern();
		
		for(Triple triple : triples) {
			bgp.add(triple);
		}
		Template template = new Template(bgp);
		
		Query result = new Query(query);
		result.setQueryConstructType();
		result.setConstructTemplate(template);
		
		return result;
/*		
		
		
		// For each result variable, get the triples that bind them
		List<String> vs = query.getResultVars();
		Set<Var> closedVars = new HashSet<Var>();
		Set<Var> openVars = new HashSet<Var>();
		for(String v : vs) {
			openVars.add(Var.alloc(v));
		}


		while(!openVars.isEmpty()) {
			
			Iterator<Var> it = openVars.iterator();
			Var var = it.next();
			it.remove();
			
			closedVars.add(var);
			
			Set<Triple> ts = getTriplesByVar(var, triples);
			
			for(Triple t : ts) {
				Set<Var>
			}
			
		}
		
*/
	}
	
	public static boolean containsVar(Triple triple, Var var) {
		boolean result
			= triple.getSubject().equals(var) 
			|| triple.getPredicate().equals(var) 
			|| triple.getObject().equals(var)
			;
		
		return result;
	}
	
	public static Set<Var> getVarsMentioned(Triple triple) {
		Set<Var> result = new HashSet<Var>();
	
		if(triple.getSubject().isVariable()) {
			result.add((Var)triple.getSubject());
		}
		else if(triple.getPredicate().isVariable()) {
			result.add((Var)triple.getPredicate());
		}
		else if(triple.getObject().isVariable()) {
			result.add((Var)triple.getObject());
		}
		
		return result;
	}
	
	public static Set<Triple> getTriples(Query query) {
		Element element = query.getQueryPattern();
		Set<Triple> result = getTriples(element);
		return result;
	}

	public static Set<Triple> getTriples(Element element) {
		Set<Triple> result = new HashSet<Triple>();
		getTriples(element, result);
		
		return result;
	}

	public static void getTriples(Element element, Collection<Triple> results) {
		if(element instanceof ElementFilter) {
			// Nothing Todo
		}
		else if(element instanceof ElementGroup) {
			ElementGroup e = (ElementGroup)element;
			
			for(Element item : e.getElements()) {
				getTriples(item, results);
			}
		}
		else if(element instanceof ElementOptional) {
			ElementOptional e = (ElementOptional)element;

			getTriples(e.getOptionalElement(), results);
		}
		else if(element instanceof ElementTriplesBlock) {
			ElementTriplesBlock e = (ElementTriplesBlock)element;

			BasicPattern bgp = e.getPattern();
			List<Triple> triples = bgp.getList();
			for(Triple triple : triples) {
				results.add(triple);
			}
		}
		else if(element instanceof ElementPathBlock) {
			ElementPathBlock e = (ElementPathBlock)element;
			for(TriplePath tp : e.getPattern().getList()) {
				Triple triple = tp.asTriple();
				results.add(triple);
			}
			
		} else {
			throw new RuntimeException("Do not know how to handle element: " + element.getClass() + " "+ element);
		}		
	}
	

	@GET
	@Path("/exportRdf")
	@Produces(MediaType.TEXT_PLAIN)
	public StreamingOutput exportRdf(@QueryParam("service-uri") String serviceUri, @QueryParam("query") String queryString)
			throws Exception
	{
		Query tmp = QueryFactory.create(queryString);
		Query query = selectToConstruct(tmp);
		query.setQueryPattern(tmp.getQueryPattern());
	
		System.out.println(query);
		
		QueryExecutionFactory qef = createQef(serviceUri);

		final QueryExecutionStreaming qe = qef.createQueryExecution(query);
		
		
		return new StreamingOutput() {

			@Override
			public void write(OutputStream out) throws IOException,
					WebApplicationException {

				//Iterator<Triple> it = qe.execConstructStreaming();
				Model model = qe.execConstruct();
				Iterator<Triple> it = model.getGraph().find(null, null, null);
				Sink<Triple> sink = new SinkTripleOutput(out);
				
				while(it.hasNext()) {
					Triple triple = it.next();
					sink.send(triple);
				}
			}
		};
	}

	
	public static QueryExecutionFactory createQef(String serviceUri)
		throws Exception
	{
		QueryExecutionFactory qef = new QueryExecutionFactoryHttp(serviceUri);
		
		CacheCoreEx cacheBackend = CacheCoreH2.create("sparql",
				24l * 60l * 60l * 1000l, true);
		CacheEx cacheFrontend = new CacheExImpl(cacheBackend);		
		qef = new QueryExecutionFactoryCacheEx(qef, cacheFrontend);
		qef = new QueryExecutionFactoryPaginated(qef, 1000);

		return qef;
		
	}
	
	
	@GET
	@Path("/exportCsv")
	@Produces("text/csv")
	public StreamingOutput exportCsv(@QueryParam("service-uri") String serviceUri, @QueryParam("query") String queryString)
		throws Exception
	{
		QueryExecutionFactory qef = createQef(serviceUri);

		Query query = QueryFactory.create(queryString);
		
		final QueryExecutionStreaming qe = qef.createQueryExecution(query);
		
		
		return new StreamingOutput() {

			@Override
			public void write(OutputStream out) throws IOException,
					WebApplicationException {

				ResultSet rs = qe.execSelect();
				String[] varNames = rs.getResultVars().toArray(new String[]{});
				String[] entries = new String[varNames.length];
				
				CSVWriter writer = new CSVWriter(new OutputStreamWriter(out));
				while(rs.hasNext()) {
					QuerySolution qs = rs.nextSolution();
					
					
					for(int i = 0; i < varNames.length; ++i) {
						String varName = varNames[i];
						
						Node node = qs.get(varName).asNode();

						String str;
						
						if(node.isLiteral()) {
							str = node.getLiteralLexicalForm();
						} else {
							str = "" + node;
						}
						
						entries[i] = str;
					}
					writer.writeNext(entries);
				}

				writer.close();
			}
		};

	}

	
	/*
	@POST
	@Path("/details")
	@Produces(MediaType.APPLICATION_JSON)
	public String getDetailData(@FormParam("sqlQuery") String id)
			throws Exception
	{
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("id", id);
		map.put("name", "dbpedia-linkedgeodata");
		map.put("tripleCount", 1000);
		
		Gson gson = new Gson();
		String result = gson.toJson(map);
		
		return result;
	}
*/
}


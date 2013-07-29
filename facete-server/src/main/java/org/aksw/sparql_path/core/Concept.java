package org.aksw.sparql_path.core;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.aksw.sparqlify.csv.TripleUtils;

import com.hp.hpl.jena.graph.Triple;
import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.sparql.core.Var;
import com.hp.hpl.jena.sparql.lang.ParserSPARQL10;
import com.hp.hpl.jena.sparql.lang.ParserSPARQL11;
import com.hp.hpl.jena.sparql.syntax.Element;
import com.hp.hpl.jena.sparql.syntax.ElementGroup;
import com.hp.hpl.jena.sparql.syntax.ElementTriplesBlock;

/**
 * A concept combines a SPARQL graph pattern (element) with a variable.
 * 
 *  
 * @author raven
 *
 */
public class Concept {
	private Element element;//List<Element> elements;
	private Var var;
	
	public static Concept create(String elementStr, String varName) {
		Var var = Var.alloc(varName);

		String tmp = elementStr.trim();
		boolean isEnclosed = tmp.startsWith("{") && tmp.endsWith("}");
		if(!isEnclosed) {
			tmp = "{" + tmp + "}";
		}
		
		Element element = ParserSPARQL10.parseElement(tmp); //ParserSPARQL11.parseElement(tmp);
		
		Concept result = new Concept(element, var);

		return result;
	}
	
	/**
	 * True if the concept is isomorph to { ?s ?p ?o }, ?s
	 * 
	 * @return
	 */
	public boolean isSubjectConcept() {
		if(element instanceof ElementTriplesBlock) {
			List<Triple> triples = ((ElementTriplesBlock)element).getPattern().getList();
			
			if(triples.size() == 1) {

				Triple triple = triples.get(0);

				// TODO Refactor into e.g. ElementUtils.isVarsOnly(element)
				boolean condition =
						triple.getSubject().isVariable() &&
						triple.getSubject().equals(var) &&
						triple.getPredicate().isVariable() &&
						triple.getObject().isVariable();
				
				if(condition) {
					return true;
				}
			}
		}

		return false;
	}
	
	
	public Concept(Element element, Var var) {
		super();
		this.element = element;
		this.var = var;
	}
	
	public Concept(List<Element> elements, Var var) {
		ElementGroup group = new ElementGroup();

		for(Element item : elements) {
			group.addElement(item);
		}
		
		this.element = group;
		this.var = var;
	}
	

	public Element getElement() {
		return element;
	}

	public List<Element> getElements() {
		List<Element> result;
		
		if(element instanceof ElementGroup) {
			result = ((ElementGroup)element).getElements();
		} else {
			result = Arrays.asList(element);
		}
		
		// This method always returns a copy of the elements
		result = new ArrayList<Element>(result);
		
		return result;
	}
	
	public Var getVar() {
		return var;
	}
	
	
	public Query asQuery() {
		Query result = new Query();
		result.setQuerySelectType();
		
		result.setQueryPattern(element);
		result.setDistinct(true);
		result.getProjectVars().add(var);
		
		return result;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((element == null) ? 0 : element.hashCode());
		result = prime * result + ((var == null) ? 0 : var.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Concept other = (Concept) obj;
		if (element == null) {
			if (other.element != null)
				return false;
		} else if (!element.equals(other.element))
			return false;
		if (var == null) {
			if (other.var != null)
				return false;
		} else if (!var.equals(other.var))
			return false;
		return true;
	}

	@Override
	public String toString() {
		return "Concept [element=" + element + ", var=" + var + "]";
	}
}

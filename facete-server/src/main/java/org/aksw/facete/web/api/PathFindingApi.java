package org.aksw.facete.web.api;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.aksw.jena_sparql_api.core.QueryExecutionFactory;
import org.aksw.jena_sparql_api.http.QueryExecutionFactoryHttp;
import org.aksw.sparql_path.core.Concept;
import org.aksw.sparql_path.core.Main;
import org.aksw.sparql_path.core.Path;

import com.google.gson.Gson;

class ServiceDesc {
	private String serviceIri;
	private List<String> defaultGraphIris;
	public String getServiceIri() {
		return serviceIri;
	}
	public void setServiceIri(String serviceIri) {
		this.serviceIri = serviceIri;
	}
	public List<String> getDefaultGraphIris() {
		return defaultGraphIris;
	}
	public void setDefaultGraphIris(List<String> defaultGraphIris) {
		this.defaultGraphIris = defaultGraphIris;
	}
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime
				* result
				+ ((defaultGraphIris == null) ? 0 : defaultGraphIris.hashCode());
		result = prime * result
				+ ((serviceIri == null) ? 0 : serviceIri.hashCode());
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
		ServiceDesc other = (ServiceDesc) obj;
		if (defaultGraphIris == null) {
			if (other.defaultGraphIris != null)
				return false;
		} else if (!defaultGraphIris.equals(other.defaultGraphIris))
			return false;
		if (serviceIri == null) {
			if (other.serviceIri != null)
				return false;
		} else if (!serviceIri.equals(other.serviceIri))
			return false;
		return true;
	}
	@Override
	public String toString() {
		return "ServiceDesc [serviceIri=" + serviceIri + ", defaultGraphIris="
				+ defaultGraphIris + "]";
	}
	
	
}

class ConceptDesc {
	private String elementStr;
	private String varName;
	public String getElementStr() {
		return elementStr;
	}
	public void setElementStr(String elementStr) {
		this.elementStr = elementStr;
	}
	public String getVarName() {
		return varName;
	}
	public void setVarName(String varName) {
		this.varName = varName;
	}
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result
				+ ((elementStr == null) ? 0 : elementStr.hashCode());
		result = prime * result + ((varName == null) ? 0 : varName.hashCode());
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
		ConceptDesc other = (ConceptDesc) obj;
		if (elementStr == null) {
			if (other.elementStr != null)
				return false;
		} else if (!elementStr.equals(other.elementStr))
			return false;
		if (varName == null) {
			if (other.varName != null)
				return false;
		} else if (!varName.equals(other.varName))
			return false;
		return true;
	}
	@Override
	public String toString() {
		return "ConceptDesc [elementStr=" + elementStr + ", varName=" + varName
				+ "]";
	}
	
	
}

class PathDesc {
	private ServiceDesc service;
	private ConceptDesc sourceConcept;
	private ConceptDesc targetConcept;
	
	public ServiceDesc getService() {
		return service;
	}
	public void setService(ServiceDesc service) {
		this.service = service;
	}
	public ConceptDesc getSourceConcept() {
		return sourceConcept;
	}
	public void setSourceConcept(ConceptDesc sourceConcept) {
		this.sourceConcept = sourceConcept;
	}
	public ConceptDesc getTargetConcept() {
		return targetConcept;
	}
	public void setTargetConcept(ConceptDesc targetConcept) {
		this.targetConcept = targetConcept;
	}
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((service == null) ? 0 : service.hashCode());
		result = prime * result
				+ ((sourceConcept == null) ? 0 : sourceConcept.hashCode());
		result = prime * result
				+ ((targetConcept == null) ? 0 : targetConcept.hashCode());
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
		PathDesc other = (PathDesc) obj;
		if (service == null) {
			if (other.service != null)
				return false;
		} else if (!service.equals(other.service))
			return false;
		if (sourceConcept == null) {
			if (other.sourceConcept != null)
				return false;
		} else if (!sourceConcept.equals(other.sourceConcept))
			return false;
		if (targetConcept == null) {
			if (other.targetConcept != null)
				return false;
		} else if (!targetConcept.equals(other.targetConcept))
			return false;
		return true;
	}
	@Override
	public String toString() {
		return "PathDesc [service=" + service + ", sourceConcept="
				+ sourceConcept + ", targetConcept=" + targetConcept + "]";
	}
	
	
	
}

@javax.ws.rs.Path("/path-finding")
public class PathFindingApi {

	
	public static QueryExecutionFactory createQef(ServiceDesc service) {
		QueryExecutionFactory result = new QueryExecutionFactoryHttp(service.getServiceIri(), service.getDefaultGraphIris());
		
		return result;
	}
	
	
	/**
	 * Input: A JSon object with the fields:
	 * {
	 *     service: { serviceIri: '', defaultGraphIris: [] }
	 *     sourceConcept: { elementStr: '', varName: '' }
	 *     targetConcept: 
	 * }
	 * 
	 * 
	 * @param serviceDesc A json object describing the service.
	 * @param startConcept
	 * @param destConcept
	 * @return
	 */
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String findPaths(String json) {
		Gson gson = new Gson();
		PathDesc pathDesc = gson.fromJson(json, PathDesc.class);
		
		ConceptDesc sourceDesc = pathDesc.getSourceConcept();		
		Concept sourceConcept = Concept.create(sourceDesc.getElementStr(), sourceDesc.getVarName());
		
		ConceptDesc targetDesc = pathDesc.getSourceConcept();		
		Concept targetConcept = Concept.create(targetDesc.getElementStr(), targetDesc.getVarName());
		
		ServiceDesc serviceDesc = pathDesc.getService();
		QueryExecutionFactory service = createQef(serviceDesc);
		
		List<Path> paths = Main.findPaths(service, sourceConcept, targetConcept);
		
		List<String> tmp = new ArrayList<String>();
		for(Path path : paths) {
			tmp.add(path.toPathString());
		}
		
		String result = gson.toJson(tmp);
		return result;
	}
}

package org.aksw.facete.web.api;

import java.util.List;

import javax.ws.rs.Path;

class ServiceDesc {
	private String serviceIri;
	private List<String> defaultGraphNames;
}

class ConceptDesc {
	private String elementStr;
	private String varName;
}

@Path("/path-finding")
public class PathFindingApi {

	
	/**
	 * 
	 * 
	 * @param serviceDesc A json object describing the service.
	 * @param startConcept
	 * @param destConcept
	 * @return
	 */
	public String findPaths(String serviceDesc, String startConcept, String destConcept) {
		// TODO Use GSON to parse the arguments...
		
		//Gson gson = new Gson();
		
		// TODO Invoke the core code...
		
		return null;
	}
}

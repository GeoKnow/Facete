package org.aksw.facete.web.api;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.aksw.commons.util.strings.StringUtils;


/*
interface HashDao {
	
}
*/


@javax.ws.rs.Path("/permalink")
public class PermaLinkApi {

	//private DataSource permaLinkDb; 
	// Actually, we could use hibernate...
	//private EntityManager entityManager;
	
	private static final Map<String, String> map = new HashMap<String, String>();
	
	
	/**
	 * 
	 * 
	 * 
	 * @param json
	 * @return An ID for successive lookups of the stored object
	 * @throws ClassNotFoundException
	 * @throws SQLException
	 */
	@Path("/saveState")
	@POST
	@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
	@Produces(MediaType.APPLICATION_JSON)
	public String store(@FormParam("state") String json) {
		// TODO Validate against an object model. Otherwise, we script kiddies may fill the DB with rubbish
		
		
		String hash = StringUtils.md5Hash(json);

		
		map.put(hash, json);
		//entityManager.persist(arg0)
		
		String result = "{\"hash\": \"" + hash + "\" }";
		return result;
	}
	

	@Path("/loadState")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String load(@QueryParam("hash") String hash) {
		
		String json = map.get(hash);
		if(json == null) {
			throw new RuntimeException("No entry for " + hash);
		}
		
		return json;
	}

}


package org.aksw.facete.web.api;

import java.lang.reflect.Type;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.sql.DataSource;
import javax.ws.rs.Consumes;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.aksw.commons.util.jdbc.ColumnsReference;
import org.aksw.commons.util.jdbc.Inserter;
import org.aksw.commons.util.jdbc.Schema;
import org.aksw.commons.util.jdbc.SqlUtils;
import org.aksw.commons.util.strings.StringUtils;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;


/*
interface HashDao {
	
}
*/



@Service
//@Component
@javax.ws.rs.Path("/permalink")
public class PermaLinkApi
//	implements ServletContextAware, ApplicationContextAware 
{

	//private DataSource permaLinkDb; 
	// Actually, we could use hibernate...
	//private EntityManager entityManager;
	
	//private static final Map<String, String> map = new HashMap<String, String>();
	
	@Resource(name="facete.dataSource")
	private DataSource dataSource;

	// TODO Better make this a bean configured in the applicationContext :/
	private Schema schema;

	
//	@Override
//	public void setServletContext(ServletContext context) {
//	}
//	
//	@Override
//	public void setApplicationContext(ApplicationContext context)
//			throws BeansException {
//		dataSource = (DataSource)context.getBean("facete.dataSource");
//		System.out.println("[Facete] Programmatically obtained DataSource for " + this + " is: " + dataSource);			
//	}

	
//	public PermaLinkApi(@Context ServletContext context) {
//
//
//	}
	
	
	public Schema getOrCreateSchema() throws SQLException {
		System.out.println("[Facete] Getting/Creating Schema for " + this + " from dataSource " + this.dataSource);
		if(schema == null) {
			schema = createSchema(this.dataSource);
		}
		
		return schema;
	}

	// TODO Move this method to the Schema class
	public static Schema createSchema(DataSource dataSource) throws SQLException {
		if(dataSource == null) {
			throw new RuntimeException("[Facete] DataSource is null. Apparently it was not injected.");
		}
		
		Schema result;
		Connection conn = dataSource.getConnection();
		try {
			result = Schema.create(conn);
		}
		finally {
			if(conn != null) {
				conn.close();
			}			
		}
		
		return result;
	}
//	@PostConstruct
//	public void postConstruct() throws SQLException {
//	}
	
	
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
	public String store(@FormParam("state") String rawJson, @Context HttpServletRequest req) throws SQLException {
		// TODO Validate against an object model. Otherwise, we script kiddies may fill the DB with rubbish
		
		Type mapType = new TypeToken<Map<String, Object>>() {}.getType();
        
		// Normalize the json
		Gson gson = new Gson();
		Map<String, Object> map = gson.fromJson(rawJson, mapType);
		String json = gson.toJson(map);
		
		
		Schema schema = getOrCreateSchema();
		
		Inserter inserter = new Inserter(new ColumnsReference("permalinks", "link_hash", "ip", "state"), schema);
		
		String linkHash = StringUtils.md5Hash(json);
		String ipAddr = req.getRemoteAddr();

		inserter.add(linkHash, ipAddr, json);
		
		Connection conn = dataSource.getConnection();
		try {
			inserter.flush(conn);
		}
		finally {
			conn.close();
		}

		
		String result = "{\"hash\": \"" + linkHash + "\" }";
		return result;
	}
	

	@Path("/loadState")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String load(@QueryParam("hash") String hash, @Context HttpServletRequest req) throws SQLException {
		
		String sql = "SELECT \"state\" FROM \"permalinks\" WHERE \"link_hash\" = ?";
		
		Connection conn = dataSource.getConnection();
		String json;
		try {
			json = SqlUtils.execute(conn, sql, String.class, hash);
		}
		finally {
			conn.close();
		}

		//String json = map.get(hash);
		if(json == null) {
			throw new RuntimeException("No entry for " + hash);
		}
		
		return json;
	}



}


package org.aksw.sparql_path.core.domain;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class Concept {
	@Id
	private Long id;
	
	private String element;
	private String hash;
}

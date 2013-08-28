package org.aksw.sparql_path.core;

import org.aksw.sparql_path.core.domain.Path;

public interface PathCallback {
	void handle(Path path);
}
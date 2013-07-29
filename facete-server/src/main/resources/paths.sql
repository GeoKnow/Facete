CREATE TABLE path_state (
	id INT PRIMARY KEY,
	process_id INT, -- The process tells us, what the goal of the pathfinding was?!
	--segment_id INT,
	contxt_id text DEFAULT NULL,
	target_node_id text NOT NULL,
	is_inverse BOOLEAN NOT NULL,
	path_length INT
);

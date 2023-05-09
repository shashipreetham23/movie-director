const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());
let db = null;
const initDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`Db Error: ${error.message}`);
    process.exit(1);
  }
};
initDbAndServer();
const convertMovieDbToResponse = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.movie_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const convertDirectorDbToResponse = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
app.get("/movies/", async (request, response) => {
  const getMovies = `
    SELECT
     movie_name
    FROM
     movie;`;
  const moviesArray = await db.all(getMovies);
  response.send(moviesArray.map((movie) => ({ movieName: movie.movie_name })));
});
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `
    SELECT
     *
    FROM
     movie
    WHERE
     movie_id=${movieId};`;
  const movie = await db.get(getMovie);
  response.send(convertMovieDbToResponse(movie));
});
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovie = `
    INSERT INTO
    movie(director_id,movie_name,lead_actor)
    VALUES (${directorId},'${movieName}','${leadActor}');`;
  await db.run(postMovie);
  response.send("Movie Successfully Added");
});
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovie = `
    UPDATE movie
    SET 
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE
     movie_id=${movieId};`;
  await db.run(updateMovie);
  response.send("Movie Details Updated");
});
app.delete("/movie/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
    DELETE FROM
     movie
    WHERE
     movie_id=${movieId};`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});
app.get("/directors/", async (request, response) => {
  const getDirectors = `
    SELECT
     *
    FROM
     director;`;
  const directorsArray = await db.all(getDirectors);
  response.send(
    directorsArray.map((each) => convertDirectorDbToResponse(each))
  );
});
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovies = `
    SELECT
     movie_name
    FROM 
     movie 
    WHERE
     director_id=${directorId};`;
  const moviesArray = await db.all(getDirectorMovies);
  response.send(moviesArray.map((each) => ({ movieName: each.movie_name })));
});
module.exports = app;

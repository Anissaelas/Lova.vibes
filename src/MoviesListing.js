import Movie from "./Movie";
const data = [
  {
    id: "tt5637536",
    primaryImage: {
      id: "rm1197290240",
      width: 720,
      height: 720,
      url:
        "https://m.media-amazon.com/images/M/MV5BNmM1NmY4N2QtNmVkOS00MjMyLWI5ZGUtYWYxMDRjY2MzNDdiXkEyXkFqcGdeQXVyMTAwMDAwMA@@._V1_.jpg",
      caption: {
        plainText: "Avatar: The Way of Water (2022)",
        __typename: "Markdown"
      },
      __typename: "Image"
    },
    title: "Avatar 5",
    releaseYear: 2028
  },
  {
    id: "tt27696374",
    primaryImage: {
      id: "rm2193304833",
      width: 3300,
      height: 5100,
      url:
        "https://m.media-amazon.com/images/M/MV5BZjI3MTg1MzEtNWJlOC00MTJkLThkMTctZjEyMzZiZDBmOWQ3XkEyXkFqcGdeQXVyMTYzNTExOTQ2._V1_.jpg",
      caption: {
        plainText: "Agent Owen (2028)",
        __typename: "Markdown"
      },
      __typename: "Image"
    },
    title: "Agent Owen",
    releaseYear: 2028
  },
  {
    id: "tt3095356",
    primaryImage: {
      id: "rm1197290240",
      width: 720,
      height: 720,
      url:
        "https://m.media-amazon.com/images/M/MV5BNmM1NmY4N2QtNmVkOS00MjMyLWI5ZGUtYWYxMDRjY2MzNDdiXkEyXkFqcGdeQXVyMTAwMDAwMA@@._V1_.jpg",
      caption: {
        plainText: "Avatar: El sentido del agua (2022)",
        __typename: "Markdown"
      },
      __typename: "Image"
    },
    title: "Avatar 4",
    releaseYear: 2026
  },
  {
    id: "tt21361444",
    primaryImage: {
      id: "rm3349350401",
      width: 1920,
      height: 2883,
      url:
        "https://m.media-amazon.com/images/M/MV5BZWE0MjkyNGQtMjgwMS00NGIwLTg5YmEtYThlOTQ1NTZmNWFmXkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_.jpg",
      caption: {
        plainText: "Avengers: Secret Wars (2026)",
        __typename: "Markdown"
      },
      __typename: "Image"
    },
    title: "Avengers: Secret Wars",
    releaseYear: 2026
  },
  {
    id: "tt12115482",
    primaryImage: {
      id: "rm1788672257",
      width: 1169,
      height: 1851,
      url:
        "https://m.media-amazon.com/images/M/MV5BZGMzZmIwMTgtMzNlOC00ZDFiLWI5YWQtYTg3N2EzN2JmYzg5XkEyXkFqcGdeQXVyNTcxOTU4Njg@._V1_.jpg",
      caption: {
        plainText: "Kevin Lucero Less in Felt (2025)",
        __typename: "Markdown"
      },
      __typename: "Image"
    },
    title: "Felt",
    releaseYear: 2025
  },
  {
    id: "tt13963798",
    primaryImage: {
      id: "rm1309004801",
      width: 1000,
      height: 1500,
      url:
        "https://m.media-amazon.com/images/M/MV5BNTk3NzcwMTYtN2M1NS00MjFlLTk5ZDctMWRhMWIyMTgxZDE1XkEyXkFqcGdeQXVyMTE4NzQ3MjU3._V1_.jpg",
      caption: {
        plainText: "Stryd (2025)",
        __typename: "Markdown"
      },
      __typename: "Image"
    },
    title: "Stryd",
    releaseYear: 2025
  },
  {
    id: "tt7890826",
    primaryImage: {
      id: "rm1199394816",
      width: 2475,
      height: 3494,
      url:
        "https://m.media-amazon.com/images/M/MV5BOTVjODU5ODUtMzYyMy00NzgwLTgxNzMtNDFjNTM2NWNmODQxXkEyXkFqcGdeQXVyODMwMzY2NTM@._V1_.jpg",
      caption: {
        plainText: "Naya Legend of the Golden Dolphin (2025)",
        __typename: "Markdown"
      },
      __typename: "Image"
    },
    title: "Naya Legend of the Golden Dolphin",
    releaseYear: 2025
  },
  {
    id: "tt15716018",
    primaryImage: {
      id: "rm2854745089",
      width: 5400,
      height: 7200,
      url:
        "https://m.media-amazon.com/images/M/MV5BNjMyZTJlNmMtZDJkYS00YWFlLWE1NDEtZTUxYTU1MWU5NjU3XkEyXkFqcGdeQXVyNDMzNTI2NzI@._V1_.jpg",
      caption: {
        plainText: "Trail Blazers: The Aftermath (Part 2) (2025)",
        __typename: "Markdown"
      },
      __typename: "Image"
    },
    title: "Trail Blazers: The Aftermath (Part 2)",
    releaseYear: 2025
  },
  {
    id: "tt19847976",
    primaryImage: {
      id: "rm2538941441",
      width: 2000,
      height: 3000,
      url:
        "https://m.media-amazon.com/images/M/MV5BZDA1ODUxZDUtM2IyYy00MzQzLWExN2UtZjNkOGRhNGFiNTdlXkEyXkFqcGdeQXVyNTk5NTQzNDI@._V1_.jpg",
      caption: {
        plainText: "Wicked: Part Two (2025)",
        __typename: "Markdown"
      },
      __typename: "Image"
    },
    title: "Wicked: Part Two",
    releaseYear: 2025
  },
  {
    id: "tt21357150",
    primaryImage: {
      id: "rm4272097281",
      width: 1920,
      height: 2883,
      url:
        "https://m.media-amazon.com/images/M/MV5BMTMyMTMwYTctMjExYi00NTc3LWEwYjAtZWJmODVkZDU1NTZiXkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_.jpg",
      caption: {
        plainText: "George Lorimer in Avengers: The Kang Dynasty (2025)",
        __typename: "Markdown"
      },
      __typename: "Image"
    },
    title: "Avengers: The Kang Dynasty",
    releaseYear: 2025
  },
  {
    id: "tt23644356",
    primaryImage: {
      id: "rm1846819585",
      width: 750,
      height: 1066,
      url:
        "https://m.media-amazon.com/images/M/MV5BYmFhYjBjYzctZDEzMy00N2JkLWEwZGItM2Y0YTU0MGFlZTE5XkEyXkFqcGdeQXVyMTc2NzgzODM@._V1_.jpg",
      caption: {
        plainText: "Spell Warriors: Shield and Shadow (2025)",
        __typename: "Markdown"
      },
      __typename: "Image"
    },
    title: "Spell Warriors: Shield and Shadow",
    releaseYear: 2025
  }
];
function MovieListing() {
  return (
    <div className="MoviesList row">
      {data.map((user, idx) => {
        return (
          <Movie
            key={idx}
            title={user.title}
            releaseYear={user.releaseYear}
            image={user.primaryImage}
          />
        );
      })}
      {/*  anaonymus function  */}
    </div>
  );
} //movieListing component
export default MovieListing;

import "bootstrap/dist/css/bootstrap.css";
function Movie(props) {
  const style = {
    width: "{props.image.width}px",
    height: "{props.image.height}px",
    id: "{props.image.id}"
  };
  const style1 = {
    width: "18rem"
  };
  return (
    <>
      <div className="movie col-md-4">
        <div className="card" style={style1}>
          <img
            style={style}
            className="card-img-top"
            src={props.image.url}
            alt="This image is beloe"
          />
          <div className="card-body">
            <h5 className="card-title">{props.title}</h5>
            <p className="card-text">{props.image.caption.plainText}</p>
          </div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              Release Year is {props.releaseYear}
            </li>
          </ul>
        </div>
      </div>
    </>
  );
} //movie componenet
export default Movie;

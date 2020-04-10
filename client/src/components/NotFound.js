import React from "react";

const NoMatch = ({ location }) => (
  <div className="not-found">
    <p className="h5">
      404, <code>{location.pathname}</code> not found.
    </p>
  </div>
);

export default NoMatch;

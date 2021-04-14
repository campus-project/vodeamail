import React from "react";
import Loader from "react-loader-spinner";

const Loading: React.FC<{}> = () => {
  return (
    <div
      style={{
        textAlign: "center",
        height: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Loader type="Grid" color="#db1d1d" height={40} width={40} />
    </div>
  );
};

export default Loading;

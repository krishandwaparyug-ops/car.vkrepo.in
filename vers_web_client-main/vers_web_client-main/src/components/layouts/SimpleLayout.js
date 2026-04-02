import Views from "../../views";
import Header from "../template/Header";

const SimpleLayout = () => {
  return (
    <div className="app-layout-simple app-shell flex flex-auto flex-col min-h-screen">
      <div className="flex flex-auto min-w-0">
        <div className="page-content flex flex-col flex-auto min-h-screen min-w-0 relative w-full">
          <Header />
          <Views />
        </div>
      </div>
    </div>
  );
};

export default SimpleLayout;

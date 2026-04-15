import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppRoute from "../components/route/AppRoute";
import PublicRoute from "../components/route/PublicRoute";
import { protectedRoutes, publicRoutes } from "../configs/route.configs";
import appConfig from "../configs/app.config";
import ProtectedRoute from './../components/route/ProtectedRoute';
import { ToastContainer } from "react-toastify";
import ThreeDotLoader from "../components/template/ThreeDotLoader";

const { authenticatedEntryPath } = appConfig;
const AllRoutes = (props) => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute />}>
        <Route
          path="/"
          element={<Navigate replace to={authenticatedEntryPath} />}
        />
        {protectedRoutes.map((route, index) => (
          <Route
            key={route.key + index}
            path={route.path}
            element={
              // <PageContainer {...props} {...route.meta}>
                <AppRoute
                  routeKey={route.key}
                  component={route.component}
                  {...route.meta}
                />
              // </PageContainer>
            }
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      <Route path="/" element={<PublicRoute />}>
        {publicRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <AppRoute
                routeKey={route.key}
                component={route.component}
                {...route.meta}
              />
            }
          />
        ))}
      </Route>
    </Routes>
  );
};

const View = (props) => {
  return (
    <Suspense
      fallback={
        <div className="vk-loader-screen">
          <ThreeDotLoader label="Loading VK Enterprises Software" />
        </div>
      }
    >
      <AllRoutes {...props} />
      <ToastContainer position="top-center" hideProgressBar={true} />
    </Suspense>
  );
};

export default View;

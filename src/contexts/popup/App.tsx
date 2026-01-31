import { useAppDispatch, useAppSelector } from "./hooks";
import {
  selectAppLoading,
  injectIconFontAsync,
} from "./store/features/app/appSlice";

import style from "./App.module.scss";

import { TabsContainer, TabView } from "@/components/Tabs";
import { Loading } from "@/components/Loading";
import { ThemeProvider } from "@/components/ThemeProvider";

import { Header } from "./store/features/app/Header";
import { Footer } from "./store/features/app/Footer";
import { Bookmarks } from "./store/features/bookmarks/Bookmarks";
import { Info } from "./store/features/info/Info";
import { Profiles } from "./store/features/profiles/Profiles";
import { Data } from "./store/features/data/Data";

function App() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAppLoading);

  React.useEffect(() => {
    dispatch(injectIconFontAsync());
  }, []);

  React.useLayoutEffect(() => {
    if (window.self === window.top) return;
    window.parent.postMessage(
      { type: "popup-mounted", height: document.body.clientHeight },
      "*"
    );
  }, []);

  return (
    <ThemeProvider theme="dark">
      <Loading loading={loading} spinnerSize={"2rem"}>
        <div className={style.container}>
          <Header />
          <TabsContainer>
            <TabView name="bookmarks" icon="bookmark">
              <Bookmarks />
            </TabView>
            <TabView name="page" icon="file">
              <Info />
            </TabView>
            <TabView name="profiles" icon="user">
              <Profiles />
            </TabView>
            <TabView name="data" icon="database">
              <Data />
            </TabView>
          </TabsContainer>
          <Footer />
        </div>
      </Loading>
    </ThemeProvider>
  );
}

export default App;

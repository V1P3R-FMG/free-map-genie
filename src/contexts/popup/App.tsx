import { TabsContainer, TabView } from "@/components/Tabs";

import "./App.css";
import { Header } from "./store/features/app/Header";
import { Footer } from "./store/features/app/Footer";
import { Bookmarks } from "./store/features/bookmarks/Bookmarks";
import { Info } from "./store/features/info/Info";

function App() {
  React.useEffect(() => {
    injectStyle("/assets/fmg-icons.css");
  }, []);

  return (
    <div className="container" data-theme="dark">
      <Header />
      <TabsContainer>
        <TabView name="bookmarks" icon="bookmark">
          <Bookmarks />
        </TabView>
        <TabView name="info" icon="document">
          <Info />
        </TabView>
      </TabsContainer>
      <Footer />
    </div>
  );
}

export default App;

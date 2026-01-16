import { TabsContainer, TabView } from "@/components/Tabs";

import "./App.css";
import { Bookmarks } from "./store/features/bookmarks/Bookmarks";
import { Header } from "./store/features/app/Header";
import { Footer } from "./store/features/app/Footer";

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
        <TabView name="info" icon="info">
          <h1>Info</h1>
        </TabView>
      </TabsContainer>
      <Footer />
    </div>
  );
}

export default App;

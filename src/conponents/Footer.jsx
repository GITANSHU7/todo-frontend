import { Footer } from "flowbite-react";

const AppFooter = () => {
  const year = new Date().getFullYear();
  return (
    <div className="flex mt-0 -mb-10">
    
          <Footer container className="mt-auto bg-blue-500 text-white dark:bg-slate-900 ">
        <Footer.Copyright
        className="text-white"
          by="Made With 💓 by Gitanshu Gautam"
          year={year}
        />
        
      </Footer>
    </div>
  );
}

export default AppFooter;
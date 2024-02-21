import prismadb from "@/lib/prismadb";

interface PageProps {
  params: { storeId: string };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const store = await prismadb.store.findFirst({
    where: { id: params.storeId },
  });
  return <div>Dashboard - active store is {store?.name}</div>;
};

export default Page;

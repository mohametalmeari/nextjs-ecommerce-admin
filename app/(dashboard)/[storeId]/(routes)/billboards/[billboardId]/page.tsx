import prismadb from "@/lib/prismadb";

interface PageProps {
  params: { billboardId: string };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const billboard = await prismadb.billboard.findUnique({
    where: { id: params.billboardId },
  });
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">{/* Billboard Form */}</div>
    </div>
  );
};

export default Page;

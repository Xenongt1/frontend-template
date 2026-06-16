const PageHeader: React.FC<{ title: string; description?: string }> = ({ title, description }) => {
  return (
     <div className=" items-center  gap-2">
          <h1 className="text-navy-900 text-[20px] font-semibold leading-8 m-0">{title}</h1>
          <p className="text-navy-900 text-[14px] font-semibold leading-8 m-0">{description}</p>
        </div>
)
}

export default PageHeader;

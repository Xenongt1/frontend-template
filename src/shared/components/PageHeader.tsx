const PageHeader: React.FC<{ title: string; description?: string }> = ({ title, description }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <h1 className="m-0 font-inter text-[20px] font-medium leading-[30px] text-text-primary">
        {title}
      </h1>
      {description && (
        <p className="m-0 font-inter text-[14px] font-normal leading-[21px] text-text-secondary">
          {description}
        </p>
      )}
    </div>
  );
};

export default PageHeader;

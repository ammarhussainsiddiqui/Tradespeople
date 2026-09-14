import { AlertCircle, CheckCircle, Eye } from 'lucide-react';

const Badge = ({ type }) => {
  const badgeStyles = {
    base: 'inline-flex items-center text-sm font-semibold px-3 py-1 rounded-full',
    urgent: 'bg-destructive-soft text-destructive',
    verified: 'bg-success-soft text-success-soft-foreground',
   // viewed: 'bg-success-soft text-success-soft-foreground',
    viewed: 'text-success-soft-foreground',
  };

  return (
    <div className={`
      ${badgeStyles.base} 
      ${type === 'urgent' ? badgeStyles.urgent : 
        type === 'viewed' ? badgeStyles.viewed : 
        badgeStyles.verified}
    `}>
       {type === 'urgent' ? (
        <>
          <AlertCircle className="w-4 h-4 mr-1 text-xs" />
          <span className='text-xs'>Contact Requested</span> 
        </>
      ) : type === 'viewed' ? (  
        <>
          <Eye className="w-4 h-4 mr-1 text-xs" />
          <span className='text-xs'>Viewed</span>
        </>
      ) : (
        <>
          <CheckCircle className="w-4 h-4 mr-1 text-xs" />
          <span className='text-xs'>Phone Verified</span>
        </>
      )}
    </div>
  );
};

export default Badge;

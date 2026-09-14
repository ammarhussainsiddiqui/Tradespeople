import React from 'react';
import { ChevronRight, Star } from 'lucide-react';
import Image from "next/image";

const InterestedTradespersons = ({ tradespersons, onSelectPerson, selectedPersonId }) => (
  <div className="tradespersons-list bg-surface p-4 rounded-lg shadow-lg">
    <div className='pb-2 border-b border-neutral-200'>
      <h3 className='text-2xl font-semibold'>Interested Tradespersons</h3>
      <p className='text-neutral-600 text-sm mt-1'>These tradesperson are interested in your job.</p>
    </div>
    <ul>

      {tradespersons.map((person) => (
        <li
          key={person?.id}
          className={`person-item flex items-center p-2 cursor-pointer hover:bg-neutral-100 rounded-lg ${person?.id === selectedPersonId ? 'bg-neutral-200' : ''}`}
          onClick={() => onSelectPerson(person?.id)}
        >
          <div className="person-image mr-3">
            <Image
              src={person?.profileUrl || "/avatar-placeholder.png"}
              alt={`${person?.firstName ?? ""} ${person?.lastName ?? ""}`}
              width={50}
              height={50}
              className="rounded-full"
              sizes="50px"
            />
          </div>
          <div className="flex justify-between w-full person-details">
            <div>
              <h4 className="text-lg font-semibold">{person?.firstName} {person?.lastName}</h4>
              <div className='flex items-center text-sm'>
                <Star size={20} color='hsl(var(--accent))' />
                <span className='px-1'>{person?.rating || '0'}/5</span>
                <p className='text-muted-foreground'>&nbsp; {person?.reviews || 0} reviews</p>
              </div>
            </div>
            <div className='flex items-center'>
              <ChevronRight />
            </div>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default InterestedTradespersons;

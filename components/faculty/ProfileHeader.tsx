/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { Pencil } from 'lucide-react';

interface ProfileHeaderProps {
  name: string;
  designation: string;
  department: string;
  publications: number;
  projects: number;
  students: number;
  profileImage?: string | null;
  isOwnProfile?: boolean;
}

/**
 * Faculty profile header with photo, name, and key metrics
 * Displays the main information at the top of the faculty detail page
 */
export default function ProfileHeader({
  name,
  designation,
  department,
  publications,
  projects,
  students,
  profileImage,
  isOwnProfile = false,
}: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          {/* Profile photo */}
          {profileImage ? (
            <img
              src={profileImage}
              alt={name}
              className="w-[130px] h-[130px] rounded-full object-cover shrink-0 border-[3px] border-[#2d6a4f]"
            />
          ) : (
            <div className="w-[130px] h-[130px] rounded-full bg-[#d4e5dd] shrink-0 border-[3px] border-[#2d6a4f] flex items-center justify-center">
              <span className="text-4xl text-[#2d6a4f] font-bold">
                {name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </span>
            </div>
          )}

          <div>
            <h1 className="text-[32px] font-bold text-[#1a1a1a] mb-1 leading-tight">
              {name}
            </h1>
            <p className="text-[#666666] text-[16px] mb-4 font-normal">
              {designation} • Department of {department}
            </p>

            {/* Quick stats badges */}
            <div className="flex gap-3 text-[15px]">
              <div className="bg-[#f1f1f1] px-4 py-1.5 rounded-3xl">
                <span className="font-normal text-[#2d6a4f]">Publications: </span>
                <span className="font-bold text-[#195339]">{publications}</span>
              </div>
              <div className="bg-[#f1f1f1] px-4 py-1.5 rounded-3xl">
                <span className="font-normal text-[#2d6a4f]">Projects: </span>
                <span className="font-bold text-[#195339]">{projects}</span>
              </div>
              <div className="bg-[#f1f1f1] px-4 py-1.5 rounded-3xl">
                <span className="font-normal text-[#2d6a4f]">Students: </span>
                <span className="font-bold text-[#195339]">{students}</span>
              </div>
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <Link
            href="/faculty/edit"
            className="bg-[#c9a961] hover:bg-[#b89850] text-white px-6 py-2.5 rounded-md text-[14px] font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit / Add Data
          </Link>
        )}
      </div>
    </div>
  );
}

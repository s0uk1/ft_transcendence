import React from "react";
import { User } from "../../../../app/types/user"
import Image from "next/image";



export default function OnlineFriendsInvite({ users }: { users: User[] }) {
    return (
        <div>
            <div className="flex flex-col items-center justify-center">
                <table className="table bg-[#26243f] md:w-3/5 lg:w-3/4">
                    <thead>
                        <tr>
                            <th className="text-lg font-normal text-[#73d3ff]">Play with a friend !!</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td className="text-center text-gray-500 text-2xl pb-8">
                                    None of your friends are online :( <span className="text-lg text-gray-600"> (do you even have any ?) </span>
                                </td>
                            </tr>
                        ) : (
                            users.map((user, index: number) => (
                                <tr key={index}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar">
                                                <div className="mask mask-squircle w-12 h-12">
                                                    <Image
                                                        src={user?.profile?.avatar ?? "/placeholderuser.jpeg"}
                                                        alt={`Avatar of ${user.username}`}
                                                        className="avatar online" 
                                                        width={48}
                                                        height={48}
                                                        />
                                                    
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#4E40F4]">{user.username}</div>
                                                <div className="text-sm opacity-50 text-[#b6b0f8]">{user.rank}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <th>
                                        <button className="btn btn-sm bg-[#3a3861]">
                                            Invite
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path d="M9.08434 11.4769C9.50494 11.4769 9.84591 11.8154 9.84591 12.233V13.2264H10.8554C11.1455 13.1952 11.428 13.3312 11.5829 13.5767C11.7377 13.8222 11.7377 14.1339 11.5829 14.3793C11.428 14.6248 11.1455 14.7609 10.8554 14.7297H9.84591V15.7319C9.84113 16.1474 9.50295 16.4832 9.08434 16.4879C8.65835 16.4831 8.32275 16.146 8.32278 15.7319V14.7297H7.31326C7.02321 14.7609 6.7407 14.6248 6.58584 14.3793C6.43097 14.1339 6.43097 13.8222 6.58584 13.5767C6.7407 13.3312 7.02321 13.1952 7.31326 13.2264H8.32278V12.233L8.32973 12.1304C8.38016 11.7614 8.69879 11.4769 9.08434 11.4769ZM16.1687 15.1868C16.3846 14.9722 16.7088 14.9064 16.9922 15.0198C17.0833 15.062 17.167 15.1184 17.2402 15.1868C17.5313 15.4796 17.5292 15.951 17.2355 16.2412C16.9418 16.5315 16.467 16.5315 16.1734 16.2412C15.8797 15.951 15.8776 15.4796 16.1687 15.1868ZM14.7164 11.6703C14.8979 11.5961 15.1016 11.5961 15.2831 11.6703C15.3779 11.7107 15.4648 11.7673 15.54 11.8374C15.6804 11.9777 15.7599 12.167 15.7613 12.3648C15.7625 12.464 15.7445 12.5625 15.7082 12.6549C15.6732 12.7494 15.6155 12.8339 15.54 12.9011C15.2424 13.1824 14.7748 13.1824 14.4773 12.9011C14.3294 12.7632 14.2455 12.5707 14.2455 12.3692C14.2455 12.1678 14.3294 11.9753 14.4773 11.8374C14.5439 11.7652 14.6255 11.7082 14.7164 11.6703ZM21.9954 11.516C21.8614 8.437 19.2534 6.08 16.1104 6.102C15.7254 6.108 15.4174 6.423 15.4224 6.809C15.4274 7.193 15.7414 7.509 16.1284 7.497C18.5754 7.448 20.4974 9.218 20.6004 11.575C20.6054 11.667 20.6064 11.76 20.6034 11.87V16.209C20.6294 17.35 20.2084 18.431 19.4204 19.254C18.6324 20.079 17.5704 20.546 16.4284 20.571C16.3354 20.573 16.2414 20.571 16.1074 20.567C13.3324 20.614 10.5694 20.614 7.85136 20.568C5.47836 20.67 3.50236 18.841 3.39936 16.491C3.39536 16.397 3.39436 16.303 3.39636 16.194V11.854C3.34536 9.5 5.21836 7.544 7.57436 7.494C7.66636 7.491 7.76036 7.494 7.88236 7.497H12.5694C12.9544 7.497 13.2674 7.185 13.2674 6.799V5.864C13.2474 4.416 12.0604 3.247 10.6214 3.247H10.6014H9.61136H9.60536C9.45836 3.247 9.31936 3.19 9.21336 3.086C9.10536 2.982 9.04536 2.841 9.04436 2.691C9.04036 2.308 8.72836 2 8.34736 2H8.33936C7.95436 2.004 7.64536 2.32 7.64936 2.705C7.65536 3.227 7.86336 3.717 8.23636 4.082C8.61036 4.45 9.10236 4.621 9.61936 4.643H10.6064H10.6164C11.3004 4.643 11.8634 5.197 11.8714 5.872V6.102L7.91236 6.103C7.78736 6.098 7.66336 6.096 7.54136 6.098C4.41936 6.166 1.93336 8.762 2.00136 11.87V16.18C1.99936 16.303 2.00036 16.426 2.00536 16.55C2.14236 19.67 4.78536 22.115 7.87036 21.962C9.21136 21.986 10.5764 21.997 11.9474 21.997C13.3264 21.997 14.7114 21.986 16.0894 21.961C16.2144 21.966 16.3384 21.968 16.4614 21.965C17.9734 21.932 19.3824 21.313 20.4284 20.219C21.4744 19.126 22.0324 17.691 21.9984 16.194V11.887C22.0014 11.764 22.0004 11.64 21.9954 11.516Z" fill="#77DFF8" />
                                                </svg>
                                            </svg>
                                        </button>
                                    </th>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

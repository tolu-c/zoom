import sequelize from '../../data/sequelize';

import { distance } from '../../config';

export async function getNearByDriver({ riderId, pickUpLat, pickUpLng, categoryId, attributes }) {
    return await sequelize.query(`
                          SELECT
                                ${attributes || '*'},
                                (
                                  6371 *
                                  acos(
                                      cos( radians( ${pickUpLat} ) ) *
                                      cos( radians( lat ) ) *
                                      cos(
                                          radians( lng ) - radians( ${pickUpLng} )
                                      ) +
                                      sin(radians( ${pickUpLat} )) *
                                      sin(radians( lat ))
                                  )
                              ) AS distance 
                            FROM
                                User JOIN Vehicles ON User.id=Vehicles.userId 
                            WHERE
                                (
                                    User.lat IS NOT NULL
                                ) AND (
                                    User.lng IS NOT NULL
                                ) AND (
                                    User.isActive=true
                                ) AND (
                                    User.isBan=false
                                ) AND (
                                    User.userType=2
                                ) AND (
                                    User.userStatus='active'     
                                ) AND (
                                    User.activeStatus='active'
                                ) AND (    
                                    User.deletedAt IS NULL
                                ) AND (
                                    User.updatedAt >= "${new Date(Date.now() - 5 * 60000).toISOString().slice(0, 19).replace('T', ' ')}"    
                                ) AND (
                                    User.id NOT IN(SELECT driverId FROM BookingHistory WHERE riderId="${riderId}" AND status IN(2, 0) AND updatedAt BETWEEN "${new Date(Date.now() - 2 * 60000).toISOString().slice(0, 19).replace('T', ' ')}" AND "${new Date(Date.now()).toISOString().slice(0, 19).replace('T', ' ')}")    
                                ) AND (    
                                    User.id != "${riderId}"
                                ) AND (
                                    Vehicles.vehicleType IN(${categoryId})
                                ) AND (
                                    6371 *
                                    acos(
                                        cos( radians( ${pickUpLat} ) ) *
                                        cos( radians( lat ) ) *
                                        cos(
                                            radians( lng ) - radians( ${pickUpLng} )
                                        ) +
                                        sin(radians( ${pickUpLat} )) *
                                        sin(radians( lat ))
                                    )
                                ) < ${distance}
                            ORDER BY distance ASC LIMIT 50
                        `,
        { type: sequelize.QueryTypes.SELECT }
    );
}
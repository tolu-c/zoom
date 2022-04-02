import SiteSettingsType from '../../types/siteadmin/SiteSettingsType';
import { SiteSettings } from '../../models';
import {
    GraphQLList as List,
    GraphQLString as StringType
} from 'graphql'

const getSiteSettings = {

    type: new List(SiteSettingsType),
    args: {
        type: { type: StringType }
    },

    async resolve({ request }, { type }) {

        let where;

        if (type) {
            where = {
                type
            }
        }

        let SiteSettingsData = await SiteSettings.findAll({
            attributes: [
                'id',
                'title',
                'name',
                'value',
                'type'
            ],
            where
        })

        return SiteSettingsData
    }
};

export default getSiteSettings;
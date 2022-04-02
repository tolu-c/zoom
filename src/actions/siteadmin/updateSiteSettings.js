import gql from 'graphql-tag';
import { toastr } from 'react-redux-toastr';
import {
	SITE_SETTINGS_UPLOAD_START,
	SITE_SETTINGS_UPLOAD_ERROR,
	SITE_SETTINGS_UPLOAD_SUCCESS
} from '../../constants/index'
import { setLoaderStart, setLoaderComplete } from '../loader/loader'

export default function updateSiteSettings(
	siteName, siteTitle, metaDescription, facebookLink, twitterLink, instagramLink,
	logoHeight, logoWidth, metaKeyword, homeLogo, youtubeLink, favicon
) {

	return async (dispatch, getState, { client }) => {

		dispatch({
			type: SITE_SETTINGS_UPLOAD_START
		})

		try {

			const mutation = gql`
            mutation updateSiteSettings(
                $siteName: String,
                $siteTitle: String,
                $metaDescription: String, 
                $facebookLink: String,
                $twitterLink: String,
                $instagramLink: String,
                $logoHeight: Int,
                $logoWidth: Int,
                $metaKeyword: String,
                $homeLogo: String,
                $youtubeLink: String,
				$favicon: String,
                ) {
                    updateSiteSettings(
                    siteName: $siteName
                    siteTitle: $siteTitle
                    metaDescription: $metaDescription
                    facebookLink: $facebookLink
                    twitterLink: $twitterLink
                    instagramLink: $instagramLink
                    logoHeight: $logoHeight
                    logoWidth: $logoWidth
                    metaKeyword: $metaKeyword
                    homeLogo: $homeLogo
                    youtubeLink: $youtubeLink
					favicon: $favicon
                    ){
                    status
                  }
                }
            `
			dispatch(setLoaderStart('SiteSettings'))
			const { data } = await client.mutate({
				mutation,
				variables: {
					siteName,
					siteTitle,
					metaDescription,
					facebookLink,
					twitterLink,
					instagramLink,
					logoHeight,
					logoWidth,
					metaKeyword,
					homeLogo,
					youtubeLink,
					favicon
				}
			})

			dispatch(setLoaderComplete('SiteSettings'))
			if (data && data.updateSiteSettings && data.updateSiteSettings.status == 200) {

				dispatch({
					type: SITE_SETTINGS_UPLOAD_SUCCESS
				})
				toastr.success('Success', 'The site settings have been updated successfully!')
			} else {
				dispatch({
					type: SITE_SETTINGS_UPLOAD_ERROR
				})
				toastr.error('Oops!', 'Something went wrong')
			}
		} catch (err) {
			dispatch({
				type: SITE_SETTINGS_UPLOAD_ERROR
			})
			toastr.error('Oops! Something went wrong', err)
		}

	}
}

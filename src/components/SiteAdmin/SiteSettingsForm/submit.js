import  updateSiteSettings  from '../../../actions/siteadmin/updateSiteSettings'

async function submit(values, dispatch) {
    await dispatch(
        updateSiteSettings(
            values.siteName,
            values.siteTitle,
            values.metaDescription,
            values.facebookLink,
            values.twitterLink,
            values.instagramLink,
            values.logoHeight,
            values.logoWidth,
            values.metaKeyword,
            values.homeLogo,
            values.youtubeLink,
            values.favicon
        )
    )
}

export default submit;
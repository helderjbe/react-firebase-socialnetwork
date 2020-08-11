import React from 'react';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Typography, Link } from '@material-ui/core';

const PrivacyPage = () => (
  <Card elevation={2}>
    <CardContent>
      <Typography component="h1" variant="h4" align="center" gutterBottom>
        Privacy Policy
      </Typography>
      <Typography paragraph>
        Your privacy is critically important to us.
      </Typography>
      <Typography paragraph>
        It is Flofus's policy to respect your privacy regarding any information
        we may collect while operating our website. This Privacy Policy applies
        to <Link href="https://flofus.com">https://flofus.com</Link>{' '}
        (hereinafter, "us", "we", or "
        <Link href="https://flofus.com">https://flofus.com</Link>").
        <br />
        We respect your privacy and are committed to protecting personally
        identifiable information you may provide us through the Website. We have
        adopted this privacy policy ("Privacy Policy") to explain what
        information may be collected on our Website, how we use this
        information, and under what circumstances we may disclose the
        information to third parties.
      </Typography>
      <Typography paragraph>
        This Privacy Policy applies only to information we collect through the
        Website and does not apply to our collection of information from other
        sources. This Privacy Policy, together with the Terms and conditions
        posted on our Website, set forth the general rules and policies
        governing your use of our Website. Depending on your activities when
        visiting our Website, you may be required to agree to additional terms
        and conditions.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Website Visitors
      </Typography>

      <Typography paragraph>
        Like most website operators, Flofus collects non-personally-identifying
        information of the sort that web browsers and servers typically make
        available, such as the browser type, language preference, referring
        site, and the date and time of each visitor request. Flofus's purpose in
        collecting non-personally identifying information is to better
        understand how Flofus's visitors use its website. From time to time,
        Flofus may release non-personally-identifying information in the
        aggregate, e.g., by publishing a report on trends in the usage of its
        website.
      </Typography>
      <Typography paragraph>
        Flofus also collects potentially personally-identifying information like
        Internet Protocol (IP) addresses and email addresses for signed in users
        on <Link href="https://flofus.com">https://flofus.com</Link>.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Gathering of Personally-Identifying Information
      </Typography>

      <Typography paragraph>
        Certain visitors to Flofus's websites choose to interact with Flofus in
        ways that require Flofus to gather personally-identifying information.
        The amount and type of information that Flofus gathers depends on the
        nature of the interaction. For example, we ask visitors who sign up for{' '}
        <Link href="https://flofus.com">https://flofus.com</Link> to provide
        your email address.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Security
      </Typography>
      <Typography paragraph>
        The security of your Personal Information is important to us, but
        remember that no method of transmission over the Internet, or method of
        electronic storage is 100% secure. While we strive to use commercially
        acceptable means to protect your Personal Information, we cannot
        guarantee its absolute security.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Advertisements
      </Typography>
      <Typography paragraph>
        Ads appearing on our website may be delivered to users by advertising
        partners, who may set cookies. These cookies allow the ad server to
        recognize your computer each time they send you an online advertisement
        to compile information about you or others who use your computer. This
        information allows ad networks to, among other things, deliver targeted
        advertisements that they believe will be of most interest to you. This
        Privacy Policy covers the use of cookies by Flofus and does not cover
        the use of cookies by any advertisers.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Links To External Sites
      </Typography>
      <Typography paragraph>
        Our Service may contain links to external sites that are not operated by
        us. If you click on a third party link, you will be directed to that
        third party's site. We strongly advise you to review the Privacy Policy
        and terms and conditions of every site you visit.
      </Typography>
      <Typography paragraph>
        We have no control over, and assume no responsibility for the content,
        privacy policies or practices of any third party sites, products or
        services.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Aggregated Statistics
      </Typography>
      <Typography paragraph>
        Flofus may collect statistics about the behavior of visitors to its
        website. Flofus may display this information publicly or provide it to
        others. However, Flofus does not disclose your personally-identifying
        information.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Cookies
      </Typography>
      <Typography paragraph>
        To enrich and perfect your online experience, Flofus uses "Cookies",
        similar technologies and services provided by others to display
        personalized content, appropriate advertising and store your preferences
        on your computer.
      </Typography>
      <Typography paragraph>
        A cookie is a string of information that a website stores on a visitor's
        computer, and that the visitor's browser provides to the website each
        time the visitor returns. Flofus uses cookies to help Flofus identify
        and track visitors, their usage of{' '}
        <Link href="https://flofus.com">https://flofus.com</Link>, and their
        website access preferences. Flofus visitors who do not wish to have
        cookies placed on their computers should set their browsers to refuse
        cookies before using Flofus's websites, with the drawback that certain
        features of Flofus's websites may not function properly without the aid
        of cookies.
      </Typography>
      <Typography paragraph>
        By continuing to navigate our website without changing your cookie
        settings, you hereby acknowledge and agree to Flofus's use of cookies.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Privacy Policy Changes
      </Typography>
      <Typography paragraph>
        Although most changes are likely to be minor, Flofus may change its
        Privacy Policy from time to time, and in Flofus's sole discretion.
        Flofus encourages visitors to frequently check this page for any changes
        to its Privacy Policy. Your continued use of this site after any change
        in this Privacy Policy will constitute your acceptance of such change.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Contact Information
      </Typography>
      <Typography>
        In the event that you have any questions regarding your privacy, please
        contact us by sending an e-mail to{' '}
        <Link href="mailto:helder.dever@gmail.com">helder.dever@gmail.com</Link>
        .
      </Typography>
    </CardContent>
  </Card>
);

export default PrivacyPage;

import PostTile from '@/components/feedPage/postTile';
import PostCreationWindow from '@/components/feedPage/postCreationWindow';

const Page = () => {
  return (
    <div className={`flex flex-col min-h-screen justify-center items-center`}>
      {/*<PostTile
        avatarUrl={'/images/avaTest.png'}
        username={`LolekKolek`}
        timePast={'15h'}
        contentUrl={`/images/avaTest.png`}
        likesCount={2238}
        postContent={'Cool post asdasdasdasd bla bla bla'}
      />*/}
      <PostCreationWindow />
    </div>
  );
};

export default Page;

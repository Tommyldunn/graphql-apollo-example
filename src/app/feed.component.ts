import { Component, OnInit, OnDestroy } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs/Subscription';

import gql from 'graphql-tag';

import 'rxjs/add/operator/toPromise';

const AllPostsQuery = gql`
  query allPosts {
      allPosts {
          id
          description
          imageUrl
      }
  }
`;

@Component({
  selector: 'app-feed',
  template: `
  <section class="section button-group">
    <a routerLink="/create" class="f6 link dim ba ph3 pv2 mb2 dib hot-pink">+ New Post</a>
  </section>
  <section class="w-100 section">
  <div class="posts">
    <div class="post pa3 bg-black-05" *ngFor="let post of allPosts">
      <div class="w-100" [ngStyle]="setImage(post.imageUrl)"></div>
      <div class="pt3 post-info">
        <span class="post-description">{{ post.description }}</span>
        <a class="red f6 pointer dim post-action" (click)="handleDelete(post.id)">Delete</a>
      </div>
    </div>
  </div>
  </section>
  `,
  host: { 'style': 'width: 100%;' }
})
export class FeedComponent implements OnInit, OnDestroy {

  loading = true;
  allPosts: any;
  allPostsSub: Subscription;

  constructor(
    private apollo: Apollo
  ) { }

  setImage(url: string) {
    const styles = {
      'background-image': `url(${url})`,
      'background-size': 'cover',
      'padding-bottom': '100%',
    };
    return styles;
  }

  handleDelete(id: string) {
    this.apollo.mutate({
      mutation: gql`
        mutation ($id: ID!) {
          deletePost(id: $id) {
            id
          }
        }
      `,
      variables: {
        id: id,
      },
      updateQueries: {
        allPosts: (prev: any) => {
          const allPosts = prev.allPosts.filter(post => post.id !== id);

          return {
            allPosts: [...allPosts]
          };
        }
      }
    }).toPromise();
  }

  ngOnInit() {
    this.allPostsSub = this.apollo.watchQuery({
      query: AllPostsQuery
    }).subscribe(({data, loading}: any) => {
      this.allPosts = data.allPosts;
      this.loading = loading;
    });
  }

  ngOnDestroy() {
    this.allPostsSub.unsubscribe();
  }
}

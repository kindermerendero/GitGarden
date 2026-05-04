[GitGarden](http://localhost:3000/api/garden/svg?repo=kindermerendero%2FGitGarden)
# GitGarden 🌱                                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                                             
  > Turn any GitHub repository's commit history into a generative pixel-art garden.                                                                                                                                                                                            
   
  Every commit becomes a plant. Stem height reflects lines changed. Flower color reflects the nature of the work. A feature-heavy repo grows tall and green; a bug-fixing sprint blooms in violet and rose.                                                                    
                                                                
  ---                                                                                                                                                                                                                                                                          
                                                                
  ## How it works                        

  | Commit data | → | Visual element |                                                                                                                                                                                                                                         
  |---|---|---|
  | `additions + deletions` | → | Stem height (7–24 pixel blocks) |                                                                                                                                                                                                            
  | Keyword: `feat`, `add`, `improve`... | → | Green / teal flower |                                                                                                                                                                                                           
  | Keyword: `fix`, `bug`, `hotfix`... | → | Rose / violet flower |                                                                                                                                                                                                            
  | No strong keyword | → | Sand / neutral flower |                                                                                                                                                                                                                            
  | SHA bytes | → | Flower shape (6 pixel-art sprites, 3×3 to 7×7) |                                                                                                                                                                                                           
  | Lines changed | → | Wind speed (more changes = more energy) |                                                                                                                                                                                                              
  | Lines changed > 300 | → | Bloom glow effect |                                                                                                                                                                                                                              
                                                                                                                                                                                                                                                                               
  The garden is generated from a single GitHub GraphQL query — one request, 30 commits, instant render.                                                                                                                                                                        
                                                                                                                                                                                                                                                                               
  ---                                                                                                                                                                                                                                                                          
                                                                
  ## Stack                               

  - **Next.js 16** — App Router, server-side API routes                                                                                                                                                                                                                        
  - **Octokit** — GitHub GraphQL API
  - **Framer Motion** — grow animations, stagger, wind loop, pixel dust                                                                                                                                                                                                        
  - **Tailwind CSS v4** — layout and typography                                                                                                                                                                                                                                
  - **SVG pixel-art** — `shapeRendering="crispEdges"`, 6px grid, hue-shifted shadows                                                                                                                                                                                           
                                                                                                                                                                                                                                                                               
  ---                                                                                                                                                                                                                                                                          
                                                                                                                                                                                                                                                                               
  ## Getting started                                            
                                         
  ### Requirements

  - Node.js 18+
  - A GitHub Personal Access Token (classic, `public_repo` scope)
                                                                                                                                                                                                                                                                               
  ### Setup
                                                                                                                                                                                                                                                                               
  ```bash                                                       
  git clone https://github.com/kindermerendero/GitGarden.git
  cd GitGarden
  npm install                                                                                                                                                                                                                                                                  
   
  Create .env.local:                                                                                                                                                                                                                                                           
                                                                
  GITHUB_TOKEN=ghp_your_token_here       

  Generate a token at https://github.com/settings/tokens → Classic → scope: public_repo.                                                                                                                                                                                       
   
  npm run dev                                                                                                                                                                                                                                                                  
                                                                
  Open http://localhost:3000, enter any public repo as owner/repo, and click generate garden.                                                                                                                                                                                  
                                                                
  ---                                                                                                                                                                                                                                                                          
  Export to README                                              
                                         
  After generating a garden, a Share to Profile panel appears below with a ready-to-paste markdown snippet:
                                                                                                                                                                                                                                                                               
  ![GitGarden](https://your-deployment.vercel.app/api/garden/svg?repo=owner/repo)
                                                                                                                                                                                                                                                                               
  The endpoint returns a self-contained SVG with the full pixel-art garden, cached for 1 hour (s-maxage=3600). Add it to your GitHub profile README to show your repo's commit history as a living garden.                                                                     
                                                                                                                                                                                                                                                                               
  The garden shifts color subtly based on the time of day — green at noon, blue at night, amber at dusk.                                                                                                                                                                       
                                                                
  ---                                                                                                                                                                                                                                                                          
  License                                                       
                                         
  MIT

  ---

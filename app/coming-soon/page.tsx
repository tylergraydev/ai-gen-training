import { LabShell } from '../components/LabShell';

const trainingModules = [
  { number: '17', title: 'Training data', description: 'Inspect images, captions, tags, duplicates, and bad examples—the material a model learns from.', activity: 'Curate a tiny dataset', comfy: 'Why model and LoRA quality begins with the dataset.' },
  { number: '18', title: 'One training example', description: 'Watch one clean image become noisy, enter the model, and produce a prediction that can be graded.', activity: 'Follow one image end to end', comfy: 'The learning process behind the models loaded into a workflow.' },
  { number: '19', title: 'Loss: the error score', description: 'Compare the model’s prediction with the known answer. The difference becomes its score for that attempt.', activity: 'Highlight where a guess is wrong', comfy: 'Why training previews improve—or sometimes collapse.' },
  { number: '20', title: 'Weights and learning', description: 'See millions of adjustable numbers receive tiny nudges after a mistake instead of storing whole images.', activity: 'Nudge a miniature network', comfy: 'What is actually stored inside a checkpoint.' },
  { number: '21', title: 'Batches, steps, and epochs', description: 'Separate one example, a stack of examples, one update, and a complete pass through the dataset.', activity: 'Run the training conveyor belt', comfy: 'How training step counts and saved checkpoints relate.' },
  { number: '22', title: 'Overfitting and generalization', description: 'Stop too early and the model learns too little; continue too far and it may memorize the practice set.', activity: 'Choose when training should stop', comfy: 'Why a LoRA can be weak, flexible, or overcooked.' },
  { number: '23', title: 'Checkpoints, fine-tunes, and LoRAs', description: 'Compare a full saved model, continued training, and a lightweight package of learned adjustments.', activity: 'Stack model ingredients', comfy: 'Checkpoint Loader, Load LoRA, model strength, and clip strength.' },
  { number: '24', title: 'Data quality and bias', description: 'Change the balance of a pretend dataset and see how its learned expectations shift.', activity: 'Rebalance a dataset', comfy: 'Why different models interpret the same prompt differently.' },
];

const modelModules = [
  { title: 'Variational autoencoders', short: 'VAE', description: 'Compress pixels into a smaller latent representation, then decode those latents back into visible pixels.', analogy: 'Like packing a detailed scene into a compact suitcase and unpacking it later.', comfy: 'VAE Encode and VAE Decode turn pixels into latents and latents into images.' },
  { title: 'Generative adversarial networks', short: 'GAN', description: 'A generator makes candidates while a discriminator tries to spot the fakes. Each improves through competition.', analogy: 'A counterfeiter practicing against an increasingly skilled detective.', comfy: 'GANs are less central to modern diffusion workflows, but remain important in upscaling, restoration, and image-generation history.' },
  { title: 'Autoregressive image models', short: 'AR', description: 'Generate an image as an ordered sequence of pieces, where every new piece depends on those already created.', analogy: 'Writing a sentence one word at a time without seeing the future words.', comfy: 'Useful for understanding newer image models that do not follow the classic U-Net diffusion recipe.' },
  { title: 'Diffusion transformers', short: 'DiT', description: 'Use transformer blocks as the denoising brain instead of relying only on a classic convolutional U-Net.', analogy: 'The same cleanup job, but with a different kind of crew organizing the work.', comfy: 'Modern model families can require their own model loaders, text encoders, and workflow structures.' },
  { title: 'Vision and text encoders', short: 'CLIP', description: 'Turn text and images into comparable learned representations so concepts can influence one another.', analogy: 'A shared filing system where related pictures and descriptions land near each other.', comfy: 'CLIP Text Encode creates the conditioning connected to the sampler.' },
  { title: 'Upscaling and restoration', short: '2× / 4×', description: 'Increase resolution or repair damage using models trained specifically to reconstruct plausible detail.', analogy: 'A restoration artist working from the evidence that remains—not simply stretching the canvas.', comfy: 'Upscale Model Loader and Image Upscale with Model are common finishing nodes.' },
  { title: 'Segmentation and detection', short: 'VISION', description: 'Identify objects, boundaries, regions, depth, or poses so another model can use that structure.', analogy: 'Placing transparent labeled tracing paper over an image.', comfy: 'Preprocessors can create masks and guidance maps for ControlNet and inpainting.' },
  { title: 'Video and temporal consistency', short: 'TIME', description: 'Generate multiple frames while keeping identity, motion, lighting, and objects coherent through time.', analogy: 'Drawing a flipbook where every page must agree with the pages around it.', comfy: 'Video workflows add frames, motion conditioning, and temporal models to familiar image nodes.' },
  { title: '3D generation', short: '3D', description: 'Build shapes, views, textures, or scene representations that must remain consistent from multiple camera angles.', analogy: 'Sculpting an object that has to make sense from every side.', comfy: 'Image workflows can provide concepts, textures, depth, and multi-view inputs for separate 3D tools.' },
];

export default function ComingSoonPage() {
  return (
    <LabShell
      active="roadmap"
      eyebrow="THE COURSE ROADMAP"
      title="There is much more than diffusion."
      intro="These are the next interactive lessons planned for the lab. First we will learn how models are trained; then we will compare the other systems you encounter in image tools such as ComfyUI."
    >
      <section className="roadmap-summary" aria-label="Roadmap summary">
        <div><span>TRACK 03</span><strong>8</strong><p>training lessons</p></div>
        <div><span>TRACK 04</span><strong>9</strong><p>model and tool lessons</p></div>
        <div><span>TEACHING STYLE</span><strong>LESS MATH</strong><p>visuals, analogies, and things you can change</p></div>
      </section>

      <section className="roadmap-track">
        <div className="track-heading">
          <span>TRACK 03 · PLANNED</span>
          <h2>How a model learns</h2>
          <p>The generation lessons show a trained model working. This track opens the classroom door and shows how that model acquired its behavior.</p>
        </div>
        <div className="training-roadmap-list">
          {trainingModules.map((module) => (
            <article key={module.number} className="training-roadmap-card">
              <span className="roadmap-number">{module.number}</span>
              <div className="roadmap-copy"><h3>{module.title}</h3><p>{module.description}</p></div>
              <div className="roadmap-activity"><small>INTERACTIVE IDEA</small><strong>{module.activity}</strong></div>
              <div className="roadmap-comfy"><small>WHY IT HELPS IN COMFYUI</small><span>{module.comfy}</span></div>
            </article>
          ))}
        </div>
      </section>

      <section className="roadmap-track model-track">
        <div className="track-heading">
          <span>TRACK 04 · PLANNED</span>
          <h2>Other models and tools</h2>
          <p>Not every image system denoises in the same way—and some important components do not generate images by themselves.</p>
        </div>
        <div className="model-roadmap-grid">
          {modelModules.map((module) => (
            <article key={module.short} className="model-roadmap-card">
              <span className="model-badge">{module.short}</span>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <div><small>PLAIN-LANGUAGE ANALOGY</small><strong>{module.analogy}</strong></div>
              <aside><small>COMFYUI CONNECTION</small><span>{module.comfy}</span></aside>
            </article>
          ))}
        </div>
      </section>

      <section className="roadmap-order">
        <span>RECOMMENDED BUILD ORDER</span>
        <div><b>01</b><strong>Training data</strong><i>→</i><b>02</b><strong>One training example</strong><i>→</i><b>03</b><strong>Loss and weights</strong><i>→</i><b>04</b><strong>VAE lab</strong><i>→</i><b>05</b><strong>GAN lab</strong></div>
        <p>This page is our living checklist. As lessons are built, they can move from “planned” into the active course.</p>
      </section>
    </LabShell>
  );
}
